const express = require('express');
const session = require('express-session');
const { sequelize, User, Caravan, Booking, Review } = require('./models');
const { Op } = require('sequelize');
const path = require('path');

const app = express();
const PORT = 3000;

// --- 1. 기본 설정 ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key-123',
    resave: false,
    saveUninitialized: false
}));

// 로그인 사용자 정보 전역 공유
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// --- 2. 라우트 (페이지 연결) ---

// 메인 페이지
app.get('/', async (req, res) => {
    const caravans = await Caravan.findAll({ where: { status: 'AVAILABLE' } });
    res.render('index', { caravans });
});

// 로그인
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, password } });
    if (user) {
        req.session.user = user;
        return res.redirect('/');
    }
    res.send('<script>alert("로그인 실패! 아이디/비번을 확인하세요."); location.href="/login";</script>');
});

// 회원가입
app.get('/signup', (req, res) => res.render('signup'));
app.post('/signup', async (req, res) => {
    try {
        await User.create(req.body);
        res.redirect('/login');
    } catch(e) { res.send(e.message); }
});

// 로그아웃
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// 카라반 상세 페이지
app.get('/caravan/:id', async (req, res) => {
    try {
        const caravan = await Caravan.findByPk(req.params.id, {
            include: [{ model: User, as: 'host' }, { model: Review, include: ['guest'] }]
        });
        if (!caravan) return res.send("카라반을 찾을 수 없습니다.");
        res.render('caravan-detail', { caravan });
    } catch (err) {
        console.error(err);
        res.send("에러 발생");
    }
});

// ★ 예약 요청 (에러 방지 버전)
app.post('/book/:id', async (req, res) => {
    console.log("📝 예약 요청 들어옴!");
    
    if (!req.session.user) {
        return res.send('<script>alert("로그인이 필요합니다."); location.href="/login";</script>');
    }

    try {
        const { startDate, endDate } = req.body;
        const caravanId = req.params.id;

        if (!startDate || !endDate) {
            return res.send('<script>alert("날짜를 선택해주세요."); history.back();</script>');
        }

        const caravan = await Caravan.findByPk(caravanId);
        
        // 날짜 차이 계산
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

        // 예약 생성
        await Booking.create({
            guestId: req.session.user.id,
            caravanId, 
            startDate, 
            endDate,
            totalPrice: caravan.price * diffDays,
            status: 'PENDING'
        });

        console.log("✅ 예약 성공!");
        res.redirect('/dashboard');

    } catch (error) {
        console.error("🔥 예약 에러:", error);
        res.send(`<script>alert("에러 발생: ${error.message}"); history.back();</script>`);
    }
});

// 대시보드
app.get('/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const user = req.session.user;

    let myCaravans = [], reservations = [], myBookings = [];

    if (user.role === 'HOST') {
        myCaravans = await Caravan.findAll({ where: { hostId: user.id } });
        reservations = await Booking.findAll({
            include: [{ model: Caravan, where: { hostId: user.id } }, { model: User, as: 'guest' }]
        });
    } else {
        myBookings = await Booking.findAll({
            where: { guestId: user.id },
            include: [Caravan]
        });
    }

    if (user.role === 'HOST') {
        res.render('dashboard', { user, myCaravans, reservations });
    } else {
        res.render('dashboard', { user, myBookings });
    }
});

// 예약 상태 변경
app.post('/booking/:id/update', async (req, res) => {
    await Booking.update({ status: req.body.status }, { where: { id: req.params.id } });
    res.redirect('/dashboard');
});

// 결제 처리
app.post('/booking/:id/pay', async (req, res) => {
    await Booking.update({ status: 'PAID' }, { where: { id: req.params.id } });
    res.redirect('/dashboard');
});

// 카라반 등록
app.get('/host/create', (req, res) => res.render('host/create-caravan')); 
app.post('/host/create', async (req, res) => {
    await Caravan.create({ ...req.body, hostId: req.session.user.id });
    res.redirect('/dashboard');
});

// --- 3. 서버 실행 ---
sequelize.sync({ force: false }).then(() => {
    console.log('Database synced');
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
});