/* =========================================================
   แก้ไขข้อมูลงานแต่งได้ที่ไฟล์นี้ไฟล์เดียว
   Edit all wedding details in this one file.
   ========================================================= */
window.WEDDING = {
  initials: ['SP', 'PS'],

  couple: {
    en: ['Saharat', 'Parepan'],
    th: ['สหรัถ', 'แพรพรรณ']
  },

  // Optional line under the names (leave '' to hide)
  parents: {
    en: 'Son of Mr. &amp; Jinda &nbsp;·&nbsp; Daughter of &amp; Mrs. Phawaphon',
    th: 'บุตรของ คุณจินดา &nbsp;·&nbsp; ธิดาของ คุณภวพร'
  },

  // Ceremony start, local time (ISO with timezone offset)
  date: '2027-02-09T17:00:00+07:00',
  durationHours: 7,

  venue: {
    en: { name: 'Kundala Beach Resort Hua Hin', address: '122/64 Soi Mooban Takiab, Nong Kae, Hua Hin District, Prachuap Khiri Khan 77110, Thailand.' },
    th: { name: 'กุณดาลา บีช รีสอร์ต หัวหิน', address: '122/64 ซอยหมู่บ้านตะเกียบ ตำบลหนองแก อำเภอหัวหิน จังหวัดประจวบคีรีขันธ์' },
    // Text searched on Google Maps (or paste a full maps URL into mapUrl)
    mapQuery: 'Kundala Beach Resort Hua Hin',
    mapUrl: 'https://share.google/46wDW0JTnZzmlBSnR'
  },

  rsvp: {
    by: '2027-02-09',
    email: 'bankxps@gmail.com',
    // Optional: Google Form (or any) URL. If set, the QR code and form
    // submission point there instead of e-mail.
    formUrl: 'https://share.google/46wDW0JTnZzmlBSnR'
  },

  // Optional background music file, e.g. 'assets/music.mp3'
  music: '',

  program: [
    { time: '15:00', en: 'Guest Arrival',       th: 'แขกลงทะเบียน' },
    { time: '16:00', en: 'Ceremony',            th: 'พิธีหลั่งน้ำพระพุทธมนต์' },
    { time: '17:00', en: 'Photos',              th: 'ถ่ายภาพร่วมกัน' },
    { time: '17:30', en: 'Cocktails',           th: 'ค็อกเทล' },
    { time: '18:30', en: 'Dinner',              th: 'งานเลี้ยงฉลองมงคลสมรส' },
    { time: '20:00', en: 'Speeches',            th: 'กล่าวอวยพร' },
    { time: '20:30', en: 'Cake & First Dance',  th: 'ตัดเค้ก & เต้นรำคู่แรก' },
    { time: '21:00', en: 'Party',               th: 'ปาร์ตี้' },
    { time: '23:00', en: 'Fireworks & Farewell', th: 'ส่งตัวบ่าวสาว' }
  ],

  story: [
    {
      year: '2024',
      en: { title: 'First Met', text: 'She was my senior colleague at work — and she looked so beautiful that day.' },
      th: { title: 'พบกันครั้งแรก', text: 'เธอเป็นพี่ในที่ทำงาน และวันนั้นเธอสวยมาก' }
    },
    // {
    //   year: '2022',
    //   en: { title: 'Our First Home', text: 'Two coffee mugs, one small balcony and a lot of plants.' },
    //   th: { title: 'บ้านหลังแรก', text: 'แก้วกาแฟสองใบ ระเบียงเล็ก ๆ และต้นไม้อีกเต็มบ้าน' }
    // },
    {
      year: '2026',
      en: { title: 'The Proposal', text: 'I asked her to marry me in Qingdao, China, as the sun was setting — and she said yes.' },
      th: { title: 'วันขอแต่งงาน', text: 'ผมขอเธอแต่งงานที่ชิงเต่า ประเทศจีน ในตอนที่พระอาทิตย์กำลังจะตกดิน — และเธอตอบตกลง' }
    },
    {
      year: '2027',
      en: { title: 'Forever Begins', text: 'And now, we would love for you to be there.' },
      th: { title: 'จุดเริ่มต้นของตลอดไป', text: 'และวันนี้ เราอยากให้คุณมาร่วมเป็นส่วนหนึ่ง' }
    }
  ]
};
