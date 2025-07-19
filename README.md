
## 💬📞 ChatScape – Real-Time Chat & Calling Application
[![Screenshot-2025-07-18-235259.png](https://i.postimg.cc/FHbxJBb4/Screenshot-2025-07-18-235259.png)](https://postimg.cc/bZJn7LFC)

**ChatScape** is a full-stack **real-time chat application** built using the MERN stack, enabling users to chat instantly, initiate voice/video calls, and communicate securely — all within a responsive, modern UI.

Built with **Socket.IO and WebRTC**, it provides sub-second latency for real-time messaging and seamless P2P calling. Strong authentication is implemented using **JWT and Bcrypt**, ensuring user data and messages remain secure.



## ✨ Features


💬 Real-Time Messaging using Socket.IO

📞 Voice & Video Calls with WebRTC

🔐 JWT Authentication for secure access

🔒 Bcrypt Password Hashing for strong credential protection

🧑‍🤝‍🧑 User Search, One-on-One Chats

📱 Responsive UI for mobile and desktop

🧾 Chat History stored with MongoDB

🔄 Auto Refresh and Typing Indicators

## 🔗 Demo

> 🟢 [Live App](https://chatscape11.vercel.app)  
> 💻 [Source Code](https://github.com/KrishnaGupta1111/ChatScape)



## 🛠️ Tech Stack

| Category        | Technologies                                 |
|-----------------|----------------------------------------------|
| 🖥️ Frontend     | React.js, Tailwind CSS                       |
| ⚙️ Backend      | Node.js, Express.js                          |
| 📡 Real-Time    | Socket.IO                                    |
| 🔐 Auth         | JWT, Bcrypt                                   |
| 🗂️ Database      | MongoDB (Mongoose)                           |
| 📞 Video Calls   | WebRTC                                       |
| 🚀 Deployment   | Vercel (Frontend), Render (Backend)          |

## 🧩 Folder Structure

```bash
ChatScape/
├── client/                 # React Frontend
│   ├── src/
│   └── public/
├── server/                 # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── utils/
```
## 🎯 Why I Built This

This project helped me understand:

- WebRTC for peer-to-peer video/audio calling  
- Socket.IO for real-time messaging  
- Building scalable chat architecture  
- Managing auth with JWT + Bcrypt  
- Responsive UI/UX with Tailwind CSS  




## Run Locally

Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```



## 🔐 Environment Variables


```markdown
Create a .env file in the server/ directory and add:

PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_jwt_secret
```
## 🤝 Contributing

Contributions are welcome!

If you want to improve something or fix bugs, feel free to:

- Fork the repo
- Create a branch (`git checkout -b feature/your-feature`)
- Commit your changes (`git commit -m "Add your feature"`)
- Push and create a PR

Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md) and [Contributing Guide](./CONTRIBUTING.md).

## 🙋‍♂️ Author

**Krishna Gupta**  
🌐 [Portfolio](https://krishna03.vercel.app)  
💼 [LinkedIn](https://linkedin.com/in/krishnagupta111/)  
📧 guptakrish1947@gmail.com


## 📜 License

This project is licensed under the **MIT License**.  
Feel free to use, modify, and distribute.


## 🙏 Acknowledgements

- 📡 Socket.IO Docs  
- 📞 WebRTC Fundamentals  
- 🧾 MongoDB + Mongoose  
- 🎨 Tailwind CSS  

