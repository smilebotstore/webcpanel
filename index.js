const express = require('express');
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const session = require('express-session');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const port = 3000;


const { 
    YOUR_MEMID,
    YOUR_KEYORKUT,
    YOUR_QR_CODE,
    domain,
    apikey,
    GITHUB_TOKEN,
    REPO_OWNER,
    REPO_NAME,
    FILE_PATH
} = require('./settings');


app.use(express.static('public'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

app.use(express.urlencoded({ extended: true }));

const akunFilePath = path.join(__dirname, 'system', 'account.json');

app.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/myadmin'); 
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html')); 
});

app.post('/login', (req, res) => {
    console.log("Login request received");

    const { username, password } = req.body;

    fs.readFile(akunFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error("Error reading akun.json", err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat memuat data akun.' });
        }
        try {
            const akunList = JSON.parse(data);
            const akun = akunList.find(acc => acc.username === username && acc.password === password);
            
            if (akun) {
                req.session.loggedIn = true; 
                req.session.user = username;
                return res.redirect('/myadmin'); 
            } else {
                return res.redirect('/login?error=Username%20atau%20password%20salah!');
            }
        } catch (parseError) {
            console.error("Error parsing JSON", parseError);
            return res.status(500).json({ error: 'Terjadi kesalahan dalam parsing data akun.' });
        }
    });
});

const isAuthenticated = (req, res, next) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    next();
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/nodes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'nodes.html'));
});

app.get('/buy/panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'panel.html'));
});

app.get('/buy/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adp.html'));
});

app.get('/create/panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cpanel.html'));
});

app.get('/create/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadp.html'));
});

app.get('/buy/script', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buysc.html'));
});

app.get('/aboutme', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'aboutme.html'));
});

app.get('/buy/reseller', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reseller.html'));
});

app.get('/list/user', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html')); 
});

app.get('/list/server', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'server.html')); 
});

app.get('/myadmin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'myadmin.html')); 
});


const keysFilePath = path.join(__dirname, 'system', 'panel.json');
const panelKeys = JSON.parse(fs.readFileSync(keysFilePath, 'utf-8')).keys;

const keysFilePath2 = path.join(__dirname, 'system', 'adp.json');
const adminKeys = JSON.parse(fs.readFileSync(keysFilePath2, 'utf-8')).keys;

app.post('/createpay', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: "Amount is required and must be a number." });
        }
        const apiUrl = `https://www.decode.im-rerezz.xyz/api/pay/okt-deposit`;
        const params = {
            amount: amount,
            qrcode: YOUR_QR_CODE,
            apikey: "8ec6cbac3e"
        };
        const response = await axios.get(apiUrl, { params });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request." });
    }
});

app.get('/cekstatus', async (req, res) => {
    try {
        const apiUrl = `https://www.decode.im-rerezz.xyz/api/pay/okt-status`;
        const params = {
            memid: YOUR_MEMID,
            keyorkut: YOUR_KEYORKUT,
            apikey: "8ec6cbac3e"
        };
        const response = await axios.get(apiUrl, { params });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request." });
    }
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rerezzofficial@gmail.com',
        pass: 'kpwz wfph ffml gcyk'
    }
});


app.post('/create-panel', async (req, res) => {
    const { username, ramOption, email, key } = req.body;

    if (!key || !panelKeys.includes(key)) {
        return res.status(401).json({ message: "❌ Key tidak valid!" });
    }

    if (!username || !ramOption || !email) {
        return res.status(400).json({ message: "❌ Semua input harus diisi!" });
    }

    let ram, disk, cpu;
    switch (ramOption) {
        case "panel1gb": ram = 1000; disk = 1000; cpu = 50; break;
        case "panel2gb": ram = 2000; disk = 2000; cpu = 100; break;
        case "panel3gb": ram = 3000; disk = 3000; cpu = 150; break;
        case "panel4gb": ram = 4000; disk = 4000; cpu = 200; break;
        case "panel5gb": ram = 5000; disk = 5000; cpu = 250; break;
        case "panel6gb": ram = 6000; disk = 6000; cpu = 300; break;
        case "panel7gb": ram = 7000; disk = 7000; cpu = 350; break;
        case "panel8gb": ram = 8000; disk = 8000; cpu = 400; break;
        case "panel9gb": ram = 9000; disk = 9000; cpu = 450; break;
        case "panel10gb": ram = 10000; disk = 10000; cpu = 500; break;
        case "panel11gb": ram = 11000; disk = 11000; cpu = 550; break;
        case "panel12gb": ram = 12000; disk = 12000; cpu = 600; break;
        case "panel13gb": ram = 13000; disk = 13000; cpu = 650; break;
        case "panel14gb": ram = 14000; disk = 14000; cpu = 700; break;
        case "panel15gb": ram = 15000; disk = 15000; cpu = 750; break;
        case "panel16gb": ram = 16000; disk = 16000; cpu = 800; break;
        case "panel17gb": ram = 17000; disk = 17000; cpu = 850; break;
        case "panel18gb": ram = 18000; disk = 18000; cpu = 900; break;
        case "panel19gb": ram = 19000; disk = 19000; cpu = 950; break;
        case "panel20gb": ram = 20000; disk = 20000; cpu = 1000; break;
        case "unlimited": ram = 0; disk = 0; cpu = 0; break;
        default:
            return res.status(400).json({ message: "❌ Pilihan RAM tidak valid!" });
    }

    try {
        const response = await fetch(`https://apis.xyrezz.online-server.biz.id/api/cpanel?domain=${domain}&apikey=${apikey}&username=${username}&ram=${ram}&disk=${disk}&cpu=${cpu}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (data.error) {
            return res.status(500).json({ message: `Error: ${data.error}` });
        }

        const mailOptions = {
            from: 'rerezzofficial@gmail.com',
            to: email,
            subject: 'YOUR SERVER PETRODAACTYL PANEL',
            html: `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Server Panel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        h1 {
            color: #333333;
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #555555;
            line-height: 1.6;
            font-size: 16px;
        }
        .section {
            margin-top: 20px;
        }
        .section-title {
            font-size: 20px;
            color: #333333;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .details {
            margin-top: 10px;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
        }
        .details th, .details td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
            font-size: 16px;
        }
        .details th {
            background-color: #f9f9f9;
            color: #333333;
        }
        .details td {
            cursor: pointer;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #888888;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Server Anda Telah Dibuat! 🎉</h1>
        <p>Berikut adalah detail server panel Anda:</p>

        <div class="section">
            <div class="section-title">Informasi Pengguna</div>
            <div class="details">
                <table>
                    <tr>
                        <th>ID Pengguna</th>
                        <td>${data.user.id}</td>
                    </tr>
                    <tr>
                        <th>Username</th>
                        <td>${data.user.username}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${data.user.email}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Detail Server</div>
            <div class="details">
                <table>
                    <tr>
                        <th>ID Server</th>
                        <td>${data.server.id}</td>
                    </tr>
                    <tr>
                        <th>Nama Server</th>
                        <td>${data.server.name}</td>
                    </tr>
                    <tr>
                        <th>RAM</th>
                        <td>${data.server.memory} MB</td>
                    </tr>
                    <tr>
                        <th>Disk</th>
                        <td>${data.server.disk} MB</td>
                    </tr>
                    <tr>
                        <th>CPU</th>
                        <td>${data.server.cpu}%</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Kredensial Login</div>
            <div class="details">
                <table>
                    <tr>
                        <th>Email</th>
                        <td>${data.credentials.email}</td>
                    </tr>
                    <tr>
                        <th>Username</th>
                        <td class="copyable" data-copy="${data.user.username}">${data.user.username}</td>
                    </tr>
                    <tr>
                        <th>Password</th>
                        <td class="copyable" data-copy="${data.credentials.password}">${data.credentials.password}</td>
                    </tr>
                    <tr>
                        <th>URL Login</th>
                        <td><a href="${data.credentials.login_url}" target="_blank">${data.credentials.login_url}</a></td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>Terima kasih telah menggunakan layanan kami. Jika ada pertanyaan, silakan hubungi tim support.</p>
        </div>
        <a href="${data.credentials.login_url}" class="button" target="_blank">Login ke Server Anda</a>
    </div>

    <script>
        document.querySelectorAll('.copyable').forEach(item => {
            item.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Teks telah disalin: ' + textToCopy);
                }).catch(err => {
                    console.error('Gagal menyalin teks: ', err);
                });
            });
        });
    </script>
</body>
</html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "✅ Server berhasil dibuat! Detail server telah dikirim ke email Anda.", serverInfo: data });
    } catch (error) {
        res.status(500).json({ message: "❌ Terjadi kesalahan saat membuat server. Harap coba lagi." });
    }
});


app.post("/create-adp", async (req, res) => {
    const { username, email, key } = req.body;

    if (!username || !email || !key) {
        return res.status(400).json({ message: "❌ Semua input harus diisi!" });
    }

    if (!key || !adminKeys.includes(key)) {
        return res.status(401).json({ message: "❌ Key tidak valid!" });
    }

    try {
        const randomNumbers = Math.floor(1000 + Math.random() * 9000);
        const password = `${username}${randomNumbers}`;

        const response = await axios.post(
            `${domain}/api/application/users`,
            {
                email,
                username,
                first_name: "Admin",
                last_name: "Panel",
                password,
                root_admin: true
            },
            {
                headers: {
                    Authorization: `Bearer ${apikey}`,
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            }
        );

        const adminData = response.data.attributes;

        const mailOptions = {
            from: 'rerezzofficial@gmail.com',
            to: email,
            subject: 'YOUR ADMIN ACCOUNT DETAILS',
            html: `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Admin Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        h1 {
            color: #333333;
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #555555;
            line-height: 1.6;
            font-size: 16px;
        }
        .section {
            margin-top: 20px;
        }
        .section-title {
            font-size: 20px;
            color: #333333;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .details {
            margin-top: 10px;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
        }
        .details th, .details td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
            font-size: 16px;
        }
        .details th {
            background-color: #f9f9f9;
            color: #333333;
        }
        .details td {
            cursor: pointer;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #888888;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Akun Admin Anda Telah Dibuat! 🎉</h1>
        <p>Berikut adalah detail akun admin Anda:</p>

        <div class="section">
            <div class="section-title">Informasi Pengguna</div>
            <div class="details">
                <table>
                    <tr>
                        <th>ID Pengguna</th>
                        <td>${adminData.id}</td>
                    </tr>
                    <tr>
                        <th>Username</th>
                        <td>${adminData.username}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${adminData.email}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Kredensial Login</div>
            <div class="details">
                <table>
                    <tr>
                        <th>Email</th>
                        <td>${adminData.email}</td>
                    </tr>
                    <tr>
                        <th>Username</th>
                        <td>${adminData.username}</td>
                    </tr>
                    <tr>
                        <th>Password</th>
                        <td>${password}</td>
                    </tr>
                    <tr>
                        <th>URL Login</th>
                        <td><a href="${domain}/auth/login" target="_blank">${domain}/auth/login</a></td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>Terima kasih telah menggunakan layanan kami. Jika ada pertanyaan, silakan hubungi tim support.</p>
        </div>
        <a href="${domain}/auth/login" class="button" target="_blank">Login ke Panel Admin</a>
    </div>

    <script>
        document.querySelectorAll('.copyable').forEach(item => {
            item.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Teks telah disalin: ' + textToCopy);
                }).catch(err => {
                    console.error('Gagal menyalin teks: ', err);
                });
            });
        });
    </script>
</body>
</html>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.json({
            message: "✅ Admin berhasil dibuat! Detail admin telah dikirim ke email.",
            admin: {
                id: adminData.id,
                email: adminData.email,
                username: adminData.username,
                password,
                domain: domain
            }
        });
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return res.status(500).json({ message: "Gagal membuat admin!" });
    }
});

app.post('/create-server', async (req, res) => {
    const { username, ramOption, email } = req.body;
    if (!username || !ramOption || !email) {
        return res.status(400).json({ message: "❌ Semua input harus diisi!" });
    }
    let ram, disk, cpu;
    switch (ramOption) {
        case "panel1gb": ram = 1000; disk = 1000; cpu = 50; break;
        case "panel2gb": ram = 2000; disk = 2000; cpu = 100; break;
        case "panel3gb": ram = 3000; disk = 3000; cpu = 150; break;
        case "panel4gb": ram = 4000; disk = 4000; cpu = 200; break;
        case "panel5gb": ram = 5000; disk = 5000; cpu = 250; break;
        case "panel6gb": ram = 6000; disk = 6000; cpu = 300; break;
        case "panel7gb": ram = 7000; disk = 7000; cpu = 350; break;
        case "panel8gb": ram = 8000; disk = 8000; cpu = 400; break;
        case "panel9gb": ram = 9000; disk = 9000; cpu = 450; break;
        case "panel10gb": ram = 10000; disk = 10000; cpu = 500; break;
        case "panel11gb": ram = 11000; disk = 11000; cpu = 550; break;
        case "panel12gb": ram = 12000; disk = 12000; cpu = 600; break;
        case "panel13gb": ram = 13000; disk = 13000; cpu = 650; break;
        case "panel14gb": ram = 14000; disk = 14000; cpu = 700; break;
        case "panel15gb": ram = 15000; disk = 15000; cpu = 750; break;
        case "panel16gb": ram = 16000; disk = 16000; cpu = 800; break;
        case "panel17gb": ram = 17000; disk = 17000; cpu = 850; break;
        case "panel18gb": ram = 18000; disk = 18000; cpu = 900; break;
        case "panel19gb": ram = 19000; disk = 19000; cpu = 950; break;
        case "panel20gb": ram = 20000; disk = 20000; cpu = 1000; break;
        case "unlimited": ram = 0; disk = 0; cpu = 0; break;
        default:
            return res.status(400).json({ message: "❌ Pilihan RAM tidak valid!" });
    }
    try {
        const response = await fetch(`https://apis.xyrezz.online-server.biz.id/api/cpanel?domain=${domain}&apikey=${apikey}&username=${username}&ram=${ram}&disk=${disk}&cpu=${cpu}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (data.error) {
            return res.status(500).json({ message: `Error: ${data.error}` });
        }
        const mailOptions = {
            from: 'rerezzofficial@gmail.com',
            to: email,
            subject: 'YOUR SERVER PETRODAACTYL PANEL',
            html: `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Server Panel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        h1 {
            color: #333333;
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #555555;
            line-height: 1.6;
            font-size: 16px;
        }
        .section {
            margin-top: 20px;
        }
        .section-title {
            font-size: 20px;
            color: #333333;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .details {
            margin-top: 10px;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
        }
        .details th, .details td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
            font-size: 16px;
        }
        .details th {
            background-color: #f9f9f9;
            color: #333333;
        }
        .details td {
            cursor: pointer;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #888888;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Server Anda Telah Dibuat! 🎉</h1>
        <p>Berikut adalah detail server panel Anda:</p>

        <div class="section">
            <div class="section-title">Informasi Pengguna</div>
            <div class="details">
                <table>
                    <tr>
                        <th>ID Pengguna</th>
                        <td>${data.user.id}</td>
                    </tr>
                    <tr>
                        <th>Username</th>
                        <td>${data.user.username}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${data.user.email}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Detail Server</div>
            <div class="details">
                <table>
                    <tr>
                        <th>ID Server</th>
                        <td>${data.server.id}</td>
                    </tr>
                    <tr>
                        <th>Nama Server</th>
                        <td>${data.server.name}</td>
                    </tr>
                    <tr>
                        <th>RAM</th>
                        <td>${data.server.memory} MB</td>
                    </tr>
                    <tr>
                        <th>Disk</th>
                        <td>${data.server.disk} MB</td>
                    </tr>
                    <tr>
                        <th>CPU</th>
                        <td>${data.server.cpu}%</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Kredensial Login</div>
            <div class="details">
                <table>
                    <tr>
                        <th>Email</th>
                        <td>${data.credentials.email}</td>
                    </tr>
                    <tr>
                        <th>Username</th>
                        <td class="copyable" data-copy="${data.user.username}">${data.user.username}</td>
                    </tr>
                    <tr>
                        <th>Password</th>
                        <td class="copyable" data-copy="${data.credentials.password}">${data.credentials.password}</td>
                    </tr>
                    <tr>
                        <th>URL Login</th>
                        <td><a href="${data.credentials.login_url}" target="_blank">${data.credentials.login_url}</a></td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>Terima kasih telah menggunakan layanan kami. Jika ada pertanyaan, silakan hubungi tim support.</p>
        </div>
        <a href="${data.credentials.login_url}" class="button" target="_blank">Login ke Server Anda</a>
    </div>

    <script>
        document.querySelectorAll('.copyable').forEach(item => {
            item.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Teks telah disalin: ' + textToCopy);
                }).catch(err => {
                    console.error('Gagal menyalin teks: ', err);
                });
            });
        });
    </script>
</body>
</html>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "✅ Server berhasil dibuat! Detail server telah dikirim ke email Anda.", serverInfo: data });
    } catch (error) {
        res.status(500).json({ message: "❌ Terjadi kesalahan saat membuat server. Harap coba lagi." });
    }
});

app.post("/create-admin", async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: "❌ Username dan email harus diisi!" });
    }
    try {
        const randomNumbers = Math.floor(1000 + Math.random() * 9000);
        const password = `${username}${randomNumbers}`;

        const response = await axios.post(
            `${domain}/api/application/users`,
            {
                email,
                username,
                first_name: "Admin",
                last_name: "Panel",
                password,
                root_admin: true
            },
            {
                headers: {
                    Authorization: `Bearer ${apikey}`,
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            }
        );

        const adminData = response.data.attributes;

        const mailOptions = {
            from: 'rerezzofficial@gmail.com',
            to: email,
            subject: 'YOUR ADMIN ACCOUNT DETAILS',
            html: `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Admin Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        h1 {
            color: #333333;
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #555555;
            line-height: 1.6;
            font-size: 16px;
        }
        .section {
            margin-top: 20px;
        }
        .section-title {
            font-size: 20px;
            color: #333333;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .details {
            margin-top: 10px;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
        }
        .details th, .details td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
            font-size: 16px;
        }
        .details th {
            background-color: #f9f9f9;
            color: #333333;
        }
        .details td {
            cursor: pointer;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #888888;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Akun Admin Anda Telah Dibuat! 🎉</h1>
        <p>Berikut adalah detail akun admin Anda:</p>

        <div class="section">
            <div class="section-title">Informasi Pengguna</div>
            <div class="details">
                <table>
                    <tr>
                        <th>ID Pengguna</th>
                        <td>${adminData.id}</td>
                    </tr>
                    <tr>
                        <th>Username</th>
                        <td>${adminData.username}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${adminData.email}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Kredensial Login</div>
            <div class="details">
                <table>
                    <tr>
                        <th>Email</th>
                        <td>${adminData.email}</td>
                    </tr>
                    <tr>
                        <th>Username</th>
                        <td>${adminData.username}</td>
                    </tr>
                    <tr>
                        <th>Password</th>
                        <td>${password}</td>
                    </tr>
                    <tr>
                        <th>URL Login</th>
                        <td><a href="${domain}/auth/login" target="_blank">${domain}/auth/login</a></td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="footer">
            <p>Terima kasih telah menggunakan layanan kami. Jika ada pertanyaan, silakan hubungi tim support.</p>
        </div>
        <a href="${domain}/auth/login" class="button" target="_blank">Login ke Panel Admin</a>
    </div>

    <script>
        document.querySelectorAll('.copyable').forEach(item => {
            item.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Teks telah disalin: ' + textToCopy);
                }).catch(err => {
                    console.error('Gagal menyalin teks: ', err);
                });
            });
        });
    </script>
</body>
</html>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.json({
            message: "✅ Admin berhasil dibuat! Detail admin telah dikirim ke email.",
            admin: {
                id: adminData.id,
                email: adminData.email,
                username: adminData.username,
                password,
                domain: domain
            }
        });
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return res.status(500).json({ message: "Gagal membuat admin!" });
    }
});

app.get('/api/list-users', async (req, res) => {
    try {
        let response = await fetch(`${domain}/api/application/users`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${apikey}`,
            },
        });
        let data = await response.json();
        if (data.errors) {
            return res.status(500).json({ error: `❌ *Error:* ${data.errors[0].detail}` });
        }
        let users = data.data;
        if (!users || users.length === 0) {
            return res.status(404).json({ message: '❌ *Tidak ada pengguna yang ditemukan.*' });
        }
        let userList = users.map(user => {
            let userInfo = user.attributes;
            return {
                id: userInfo.id || 'Unknown',
                username: userInfo.username || 'Unknown',
                email: userInfo.email || 'Unknown',
                language: userInfo.language || 'Unknown',
                full_name: userInfo.first_name && userInfo.last_name 
                    ? `${userInfo.first_name} ${userInfo.last_name}`
                    : 'Unknown',
                role: userInfo.root_admin ? 'Admin' : 'User',
                status: userInfo.suspended ? 'Suspended' : 'Active',
                createdAt: userInfo.created_at || 'Unknown',
            };
        });
        res.status(200).json({ data: userList });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: '❌ *Terjadi kesalahan saat mengambil daftar pengguna. Periksa konfigurasi atau coba lagi.*' });
    }
});

app.delete('/api/delete-user/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'ID pengguna tidak diberikan.' });
  try {
      let response = await fetch(`${domain}/api/application/users/${id}`, {
          method: 'DELETE',
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apikey}`,
          },
      });
      let result = response.ok ? { message: 'Successfully deleted the user.' } : await response.json();
      if (result.errors) {
          return res.status(404).json({ error: 'User not found or deletion failed.' });
      }
      res.status(200).json(result);
  } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Terjadi kesalahan saat menghapus pengguna.' });
  }
});
  
app.get('/api/list-servers', async (req, res) => {
  try {
      const page = req.query.page || '1'; 
      const response = await fetch(`${domain}/api/application/servers?page=${page}`, {
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apikey}`
          }
      });
      const data = await response.json();
      const servers = data.data;
      if (!servers || servers.length === 0) {
          return res.json({ error: '❌ Tidak ada server yang ditemukan.' });
      }
      const serverList = servers.map(server => ({
          id: server.attributes.id,
          identifier: server.attributes.identifier,
          name: server.attributes.name,
          description: server.attributes.description,
          suspended: server.attributes.suspended,
          memory: server.attributes.limits.memory == 0 ? "unlimited" : `${server.attributes.limits.memory / 1000} GB`,
          disk: server.attributes.limits.disk == 0 ? "unlimited" : `${server.attributes.limits.disk / 1000} GB`,
          cpu: server.attributes.limits.cpu == 0 ? "unlimited" : `${server.attributes.limits.cpu}%`
      }));
      res.json({ data: serverList, page: data.meta.pagination.current_page, total_pages: data.meta.pagination.total_pages });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: '❌ Terjadi kesalahan saat mengambil daftar server.' });
  }
});
app.delete('/api/delete-server/:id', async (req, res) => {
  const srvId = req.params.id;
  if (!srvId) {
      return res.json({ error: 'ID server tidak ditemukan.' });
  }
  try {
      const response = await fetch(`${domain}/api/application/servers/${srvId}`, {
          method: 'DELETE',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apikey}`
          }
      });
      if (response.ok) {
          return res.json({ message: 'Server berhasil dihapus.' });
      }
      const result = await response.json();
      return res.json({ error: result.errors || 'Server tidak ditemukan.' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: '❌ Terjadi kesalahan saat menghapus server.' });
  }
});

app.post("/create-admin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ message: "Semua input harus diisi!" });
  }
  try {
      const email = `${username}@admin.com`;
      const response = await axios.post(
          `${domain}/api/application/users`,
          {
              email,
              username,
              first_name: "Admin",
              last_name: "Panel",
              password,
              root_admin: true
          },
          {
              headers: {
                  Authorization: `Bearer ${apikey}`,
                  Accept: "application/json",
                  "Content-Type": "application/json"
              }
          }
      );
      const adminData = response.data.attributes;
      return res.json({
          message: "✅ Admin berhasil dibuat!",
          admin: {
              id: adminData.id,
              email: adminData.email,
              username: adminData.username,
              password, 
              domain: domain
          }
      });
  } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      return res.status(500).json({ message: "Gagal membuat admin!" });
  }
});

app.get('/api/nodes', async (req, res) => {
    try {
        const response = await fetch(`${domain}/api/application/nodes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '❌ Gagal mengambil daftar node.' });
    }
});

app.get('/api/nodes/:id/stats', async (req, res) => {
    const nodeId = req.params.id;
    try {
        const nodeResponse = await fetch(`${domain}/api/application/nodes/${nodeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Accept': 'application/json'
            }
        });

        const nodeData = await nodeResponse.json();
        if (!nodeData || !nodeData.attributes) {
            return res.status(404).json({ error: '❌ Node tidak ditemukan.' });
        }

        const { memory, disk, allocated_resources } = nodeData.attributes;

        const usedRAM = allocated_resources.memory || 0;
        const freeRAM = memory - usedRAM;
        const usedDisk = allocated_resources.disk || 0;
        const freeDisk = disk - usedDisk;

        res.json({
            node_id: nodeId,
            total_ram: `${memory} MB`,
            used_ram: `${usedRAM} MB`,
            free_ram: `${freeRAM} MB`,
            total_disk: `${disk} MB`,
            used_disk: `${usedDisk} MB`,
            free_disk: `${freeDisk} MB`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '❌ Terjadi kesalahan saat mengambil informasi node.' });
    }
});

app.post("/edit-repo", async (req, res) => {
    try {
        const newKey = req.body.text;

        if (!newKey) {
            return res.status(400).json({ error: "Text is required!" });
        }
        const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await axios.get(githubApiUrl, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` },
        });
        const fileData = Buffer.from(response.data.content, "base64").toString("utf-8");
        const jsonData = JSON.parse(fileData);

        if (!jsonData.keys.includes(newKey)) {
            jsonData.keys.push(newKey);
        }
        const updatedContent = Buffer.from(JSON.stringify(jsonData, null, 4)).toString("base64");
        const updateResponse = await axios.put(
            githubApiUrl,
            {
                message: "Update panel.json via API",
                content: updatedContent,
                sha: response.data.sha,
            },
            {
                headers: { Authorization: `token ${GITHUB_TOKEN}` },
            }
        );

        res.json({ success: true, data: updateResponse.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/buysc", async (req, res) => {
    const { paket, email } = req.body;

    if (!paket || !email) {
        return res.status(400).json({ message: "❌ Paket dan email harus diisi!" });
    }

    const scUrls = {
        1: "https://files.catbox.moe/sglb6i.zip",
        2: "https://files.catbox.moe/vhmfa9.zip",
        3: "https://files.catbox.moe/cwrlua.zip",
    };

    const scUrl = scUrls[paket];

    if (!scUrl) {
        return res.status(400).json({ message: "❌ Paket tidak valid!" });
    }

    try {
        const userMailOptions = {
            from: 'rerezzofficial@gmail.com',
            to: email,
            subject: '📦 Your Script File is Ready!',
            html: `
                <html>
                <body>
                    <h1>🎉 Your Script is Ready!</h1>
                    <p>Thank you for purchasing Package ${paket}. Click the button below to download your script:</p>
                    <a href="${scUrl}" target="_blank">Download Script</a>
                    <p>If you have any questions, feel free to contact our support team.</p>
                </body>
                </html>
            `
        };

        await transporter.sendMail(userMailOptions);

        return res.json({ message: "success", scUrl });
    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({ message: "❌ Gagal mengirim email. Silakan coba lagi." });
    }
});


app.listen(port, async () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});