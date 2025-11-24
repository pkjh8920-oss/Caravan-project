const { sequelize, User, Caravan } = require('./models');

async function seedData() {
    await sequelize.sync({ force: true }); // 기존 데이터 날리고 새로 생성

    console.log('🌱 데이터 심는 중...');

    // 1. 호스트 생성
    const host = await User.create({
        email: 'host@test.com',
        password: '123',
        name: '김캠핑',
        role: 'HOST',
        reliability: 4.8
    });

    // 2. 게스트 생성
    await User.create({
        email: 'guest@test.com',
        password: '123',
        name: '이여행',
        role: 'GUEST'
    });

    // 3. 카라반 데이터 3개 생성
    await Caravan.bulkCreate([
        {
            hostId: host.id,
            name: '제주도 푸른밤 빈티지 카라반',
            location: '제주 서귀포시 안덕면',
            price: 120000,
            capacity: 2,
            amenities: 'WiFi, 불멍세트, 오션뷰',
            image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80',
            status: 'AVAILABLE'
        },
        {
            hostId: host.id,
            name: '강원도 숲속 힐링 글램핑',
            location: '강원도 평창군',
            price: 180000,
            capacity: 4,
            amenities: '바베큐, 주차장, 난방',
            image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80',
            status: 'AVAILABLE'
        },
        {
            hostId: host.id,
            name: '양양 서퍼비치 카라반',
            location: '강원도 양양군',
            price: 90000,
            capacity: 2,
            amenities: '서핑보드대여, 공용샤워실',
            image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
            status: 'AVAILABLE'
        }
    ]);

    console.log('✅ 더미 데이터 생성 완료!');
}

seedData().then(() => process.exit());