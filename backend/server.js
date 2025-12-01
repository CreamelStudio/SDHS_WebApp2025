const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = 3000;

app.use(cors());
app.use(express.json());

/** 글+댓글 전부 가져오기 */
function getAllPosts(callback) {
  db.all(`SELECT * FROM posts ORDER BY createdAt DESC`, [], (err, posts) => {
    if (err) return callback(err);

    const postIds = posts.map(p => p.id);
    if (postIds.length === 0) return callback(null, []);

    db.all(
      `SELECT * FROM replies
       WHERE postId IN (${postIds.map(() => "?").join(",")})
       ORDER BY createdAt ASC`,
      postIds,
      (err2, replies) => {
        if (err2) return callback(err2);

        const replyMap = {};
        replies.forEach(r => {
          if (!replyMap[r.postId]) replyMap[r.postId] = [];
          replyMap[r.postId].push({
            id: r.id,
            user: r.user,
            text: r.text,
            createdAt: r.createdAt
          });
        });

        const result = posts.map(p => ({
          id: p.id,
          userNum: p.userNum,
          userName: p.userName,
          text: p.text,
          createdAt: p.createdAt,
          replies: replyMap[p.id] || []
        }));

        callback(null, result);
      }
    );
  });
}

/** ✅ 실시간 소켓 */
io.on("connection", (socket) => {
  console.log("🟢 connected:", socket.id);

  // 접속한 사람에게 최신 글 보내기
  getAllPosts((err, posts) => {
    if (!err) socket.emit("posts:init", posts);
  });

  socket.on("disconnect", () => {
    console.log("🔴 disconnected:", socket.id);
  });
});

/** ✅ 글 전체 조회 */
app.get("/api/posts", (req, res) => {
  getAllPosts((err, posts) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(posts);
  });
});

/** ✅ 글 작성 */
app.post("/api/posts", (req, res) => {
  const { userNum, userName, text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "text required" });

  const createdAt = Date.now();

  db.run(
    `INSERT INTO posts (userNum, userName, text, createdAt)
     VALUES (?, ?, ?, ?)`,
    [userNum, userName, text, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const newPost = {
        id: this.lastID,
        userNum,
        userName,
        text,
        createdAt,
        replies: []
      };

      io.emit("posts:created", newPost);
      res.json(newPost);
    }
  );
});

/** ✅ 글 삭제 */
app.delete("/api/posts/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run(`DELETE FROM posts WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    io.emit("posts:deleted", { id });
    res.json({ ok: true });
  });
});

/** ✅ 댓글 작성 */
app.post("/api/posts/:id/replies", (req, res) => {
  const postId = Number(req.params.id);
  const { user, text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "text required" });

  const createdAt = Date.now();

  db.run(
    `INSERT INTO replies (postId, user, text, createdAt)
     VALUES (?, ?, ?, ?)`,
    [postId, user, text, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const newReply = {
        id: this.lastID,
        postId,
        user,
        text,
        createdAt
      };

      io.emit("replies:created", newReply);
      res.json(newReply);
    }
  );
});

server.listen(PORT, () => {
  console.log(`✅ server on http://localhost:${PORT}`);
});
