// Get csrf token from Flask backend
const csrfToken = document.getElementById('csrf').firstChild.value

// Declare global scope variables
const resDelay = 700  // Delay in ms for each round of response
const resLengthLimit = 3  // Number of message to display each cycle
let resLengthCycle = 1  // Keeping track of message display cycle
let resLengthProcessed = 0  // Keeping track of processed message in each cycle
let searchMode = 1  // Search regex mode: 1 = strict, 2 = loose

// Prep arrays of avatar images to be randomly choosen
const baseImgUrl = 'https://jaideeweb.s3.ap-southeast-1.amazonaws.com/chatbot/'

const avatarMale = [
    baseImgUrl + 'm01.svg', 
    baseImgUrl + 'm02.svg', 
    baseImgUrl + 'm03.svg', 
    baseImgUrl + 'm04.svg', 
    baseImgUrl + 'm05.svg', 
    baseImgUrl + 'm06.svg', 
    baseImgUrl + 'm07.svg', 
    baseImgUrl + 'm08.svg', 
    baseImgUrl + 'm09.svg', 
    baseImgUrl + 'u01.svg', 
    baseImgUrl + 'u02.svg', 
    baseImgUrl + 'u03.svg', 
    baseImgUrl + 'u04.svg', 
    baseImgUrl + 'u05.svg', 
    baseImgUrl + 'u06.svg', 
]

const avatarFemale = [
    baseImgUrl + 'f01.svg', 
    baseImgUrl + 'f02.svg', 
    baseImgUrl + 'f03.svg', 
    baseImgUrl + 'f04.svg', 
    baseImgUrl + 'f05.svg', 
    baseImgUrl + 'f06.svg', 
    baseImgUrl + 'f07.svg', 
    baseImgUrl + 'f08.svg', 
    baseImgUrl + 'f09.svg', 
    baseImgUrl + 'u01.svg', 
    baseImgUrl + 'u02.svg', 
    baseImgUrl + 'u03.svg', 
    baseImgUrl + 'u04.svg', 
    baseImgUrl + 'u05.svg', 
    baseImgUrl + 'u06.svg', 
]

const avatarOther = [
    baseImgUrl + 'm01.svg', 
    baseImgUrl + 'm02.svg', 
    baseImgUrl + 'm03.svg', 
    baseImgUrl + 'm04.svg', 
    baseImgUrl + 'm05.svg', 
    baseImgUrl + 'm06.svg', 
    baseImgUrl + 'm07.svg', 
    baseImgUrl + 'm08.svg', 
    baseImgUrl + 'm09.svg', 
    baseImgUrl + 'u01.svg', 
    baseImgUrl + 'u02.svg', 
    baseImgUrl + 'u03.svg', 
    baseImgUrl + 'u04.svg', 
    baseImgUrl + 'u05.svg', 
    baseImgUrl + 'u06.svg', 
    baseImgUrl + 'f01.svg', 
    baseImgUrl + 'f02.svg', 
    baseImgUrl + 'f03.svg', 
    baseImgUrl + 'f04.svg', 
    baseImgUrl + 'f05.svg', 
    baseImgUrl + 'f06.svg', 
    baseImgUrl + 'u01.svg', 
    baseImgUrl + 'u02.svg', 
    baseImgUrl + 'u03.svg', 
    baseImgUrl + 'u04.svg', 
    baseImgUrl + 'u05.svg', 
    baseImgUrl + 'u06.svg', 
]

// Search function
function fetchSearch(reqInput) {
    fetch('/search/api', {
        method: 'post', 
        headers: {
            'Content-Type': 'application/json', 
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({request: reqInput})
    })
    .then(response => response.json())
    .then(data => {
        // Remove thinking bubble
        document.getElementById('resBubble').remove()
        document.getElementById('resBubbleClear').remove()

        // Set strict or loose mode according to data[0]
        if (data[0].mode == 2) {
            searchMode = 2
        } else {
            searchMode = 1
        }

        reqRes = []  // Reset reqRes array

        let pronoun = ''
        let avatarUrl = ''

        data.forEach(i => {
            if (i.result == 0) {  // If no result
                reqRes.push(
                    `
                        พี่${botName}ยังไม่มีข้อมูลที่ตรงกับที่น้องพิมพ์มา ลองพิมพ์ใหม่โดยเปลี่ยนคำหรือใช้ประโยคที่สั้นลงนะคะ
                    `
                )
            } else {  // If there's result
                // Prep pronoun and randomised avatar
                if (i.gender == 'ผู้ชาย') {
                    pronoun = 'ผม'
                    avatarUrl = avatarMale[Math.floor(Math.random()*avatarMale.length)]
                } else if (i.gender == 'ผู้หญิง') {
                    pronoun = 'เรา'
                    avatarUrl = avatarFemale[Math.floor(Math.random()*avatarFemale.length)]
                } else {
                    pronoun = 'เรา'
                    avatarUrl = avatarOther[Math.floor(Math.random()*avatarOther.length)]
                }
    
                // Put all data into template and push as array
                reqRes.push(
                    `
                    <img class="avatar" src="${avatarUrl}" alt="เพื่อน${i.gender}">
                    <span class="response-person">เพื่อน${i.gender} อายุ ${i.age} ปี จาก${i.area}</span><br><div class="spacer-big"></div>
                    ${pronoun}เคยเจอเรื่อง <span class='response-topic'>"${i.topic}"</span> 
                    ความเห็นของ${pronoun}คือ <span class='response-solution'>"${i.solution}"</span>
                    `
                )
            }
        })

        convRes()  // Call convRes to create front-end response
    })
    .catch((error) => {
        console.error('Error: ', error);
    })
}

// Search function
function fetchFeedback(reqInput) {
    convReq('ส่งความเห็นแล้ว')
    
    fetch('/feedback/api', {
        method: 'post', 
        headers: {
            'Content-Type': 'application/json', 
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({score: reqInput})
    })
    .then(response => response.json())
    .then(data => {})
    .catch((error) => {
        console.error('Error: ', error);
    })
}

// Initiate init variables from back-end
const botName = document.getElementById('botName').innerHTML
let convId = document.getElementById('convId').innerHTML
let convNum = Number(convId)

// Init variables for conversation
let reqInput = ''
let reqRes = []
let convLog = []
let interventionFlag = ''

// Init RegEx of commons vocabs
const regexGreeting = new RegExp('สวัสดี|หวัดดี|ฮัลโหล|Hi|hi|ello', 'g')
const regexThankyou = new RegExp('ขอบคุณ|ขอบใจ|hank|พอแค่นี้', 'g')
const regexEnd = new RegExp('ส่งความเห็นแล้ว', 'g')

const regexLove =  new RegExp('ความรัก', 'g')
const regexStudy =  new RegExp('เครียดเรื่องเรียน', 'g')
const regexFriend =  new RegExp('กลุ้มใจเรื่องเพื่อน', 'g')
const regexSelf =  new RegExp('รู้สึกไม่ดีกับตัวเอง', 'g')
const regexThinking =  new RegExp('คิดมาก', 'g')
const regexFinance =  new RegExp('มีเงินไม่พอใช้', 'g')
const regexFamily =  new RegExp('มีปัญหากับที่บ้าน', 'g')

// Init RegEx of intervening vocabs
const regexSuicide = new RegExp('เบื่อ|ไม่สนใจอยากทำอะไร|ไม่อยากทำอะไร|หมดความสนใจ.*ทำอะไร|ไม่มีความสุข|ไม่สบายใจ|ซึมเศร้า|หงุดหงิด|โกรธง่าย|ท้อแท้|สิ้นหวัง|นอนไม่หลับ|หลับยาก|หลับๆ.*ตื่นๆ|หลับมากไป|เหนื่อยมาก|เหนื่อยง่าย|ไม่มีเรี่ยวแรง|อ่อนเพลีย|หมดแรง|เบื่ออาหาร|กินเยอะ|เครียด.*กินอาหารมาก|น้ำหนักลด|น้ำหนักเพิ่มมาก|รู้สึกแย่|รู้สึกไม่ดีกับตัวเอง|เกลียดตัวเอง|รู้สึก.*ล้มเหลว|รู้สึกไร้ค่า|รู้สึกผิด|โทษตนเอง|โทษตัวเอง|ทำให้ครอบครัวผิดหวัง|ไม่มีสมาธิ|ใจลอย|ลังเลใจไปหมด|พูดช้า|ทำอะไรช้าลง|เชื่องช้าลง|กระสับกระส่าย|กระวนกระวาย|อยู่ไม่สุข|ไม่อยู่นิ่ง|เก็บตัว|ไม่อยากเจอใคร|อยากอยู่คนเดียว|อยากตาย|ฆ่าตัวตาย|ไม่อยากอยู่|ไม่อยากมีชีวิต|จบชีวิต|ชีวิตไม่มี.*ค่า|ตายไปคงดี|คิดเรื่องตาย|ทำร้ายตัวเอง', 'g')

// Function to start first conversation
function convStart() {
    convProcess('start')
}

// Show the input and send to process
function convReq(reqInput) {
    // Reset variables that might have been changed during prev conv
    resLengthCycle = 1
    resLengthProcessed = 0
    interventionFlag = ''

    const botConv = document.getElementById('botConv')
    const childNode = document.createElement('div')
    const childNodeClear = document.createElement('div')

    convNum += 1
    // console.log(`User input: (${convNum}) ${reqInput}`)
    childNode.setAttribute('id', convNum)
    childNode.setAttribute('class', 'conv-req')
    botConv.appendChild(childNode)
    document.getElementById(`${convNum}`).textContent = reqInput

    childNodeClear.setAttribute('class', 'clear')
    botConv.appendChild(childNodeClear)

    // Scroll the botConv div into view
    childNodeClear.scrollIntoView()

    // Push this conv into convLog
    convLog.push({
        convId: convNum, 
        time: Date.now(), 
        side: 'user', 
        message: reqInput
    })

    convProcess(reqInput)
}

// Process the input
function convProcess(reqInput) {
    // const fallbackArr = ['ฟังอยู่นะ', 'อืม', 'เล่าต่อเลย']

    // Begin RegEx matching
    if (reqInput == 'start') {
        // Responses
        reqRes = [ 
            '<img src="https://jaideeweb.s3.ap-southeast-1.amazonaws.com/chatbot/jaidee-botlogo.svg" alt="แชทบอทใจดี">', 
            `สวัสดีจ๊ะ ดีใจที่ได้มาคุยกัน
            <div class="spacer-big"></div>
            ถ้ามีเรื่องอะไรไม่สบายใจก็พิมพ์บอกกับพี่${botName}ได้เลยนะ พี่จะใช้ความสามารถ AI ของพี่ไปดึงวิธีการรับมือของเพื่อนๆ คนอื่นๆ ที่เคยเจอเรื่องคล้ายๆ กันมาให้นะ<br>
            <span class="help-text">เรื่องที่คุยกับแชทบอทใจดีจะ <a href="/about#privacy-statement" target="_blank">เป็นความลับ</a> แชทบอทจะไม่บันทึกข้อมูลส่วนตัวและไม่รู้ว่าผู้ใช้เป็นใคร`, 
            `ไม่สบายใจเรื่องอะไร กดบอกพี่${botName}หน่อย<br>
            <div class="rich-response">
                <button class="req-rich" onclick="convReq('ความรัก')">ความรัก</button>
                <button class="req-rich" onclick="convReq('เครียดเรื่องเรียน')">เครียดเรื่องเรียน</button>
                <button class="req-rich" onclick="convReq('กลุ้มใจเรื่องเพื่อน')">กลุ้มใจเรื่องเพื่อน</button>
                <button class="req-rich" onclick="convReq('รู้สึกไม่ดีกับตัวเอง')">รู้สึกไม่ดีกับตัวเอง</button>
                <button class="req-rich" onclick="convReq('คิดมาก')">คิดมาก</button>
                <button class="req-rich" onclick="convReq('มีเงินไม่พอใช้')">มีเงินไม่พอใช้</button>
                <button class="req-rich" onclick="convReq('มีปัญหากับที่บ้าน')">มีปัญหากับที่บ้าน</button>
            </div>`
        ]

        convRes()
    } else if (reqInput == 'เริ่มคุย' || (reqInput.match(regexGreeting) != null) || reqInput == 'เริ่มใหม่') {
        // Responses
        reqRes = [ 
            `ไม่สบายใจเรื่องอะไรพิมพ์บอกพี่${botName}หน่อย<br><span class="help-text">ตัวอย่าง <em>ถูกบูลลี่</em>, <em>ถูกแกล้ง</em>, <em>เครียดเรียนออนไลน์</em>, <em>เกรดตก</em>, <em>เรียนไม่ทันเพื่อน</em>, <em>เรียนต่อ</em>, <em>ครอบครัวกดดัน</em>, <em>เครียดเรื่องเงิน</em>, <em>อกหัก</em>, <em>แอบรัก</em>, <em>ทะเลาะกับแฟน</em></span>`
        ]

        convRes()
    } else if (reqInput.match(regexThankyou) != null) {
        reqRes = [
            'ดีใจที่ได้คุยกัน', 
            `ก่อนน้องจะไป ช่วยบอกพี่${botName}หน่อยว่าวันนี้พี่${botName}ช่วยน้องได้แค่ไหน<br><span class="help-text">กดเลือกได้เลย คำตอบของน้องจะถูกใช้เพื่อพัฒนาแชทบอท โดยผู้พัฒนาจะไม่รู้ว่าน้องเป็นใคร</span><br>
            <div class="rich-response">
                <button class="req-rich" onclick="fetchFeedback('best')">ช่วยได้มาก</button>
                <button class="req-rich" onclick="fetchFeedback('average')">ช่วยได้บ้าง</button>
                <button class="req-rich" onclick="fetchFeedback('none')">ช่วยไม่ได้เลย</button>
            </div>`
        ]

        convRes()
    } else if (reqInput.match(regexEnd) != null) {
        reqRes = [
            'ขอบคุณสำหรับความเห็นนะ', 
            `รู้ไหมว่าน้องสามารถช่วยเหลือเพื่อนๆ ที่มาปรึกษาปัญหากับพี่${botName}ได้ โดยการ <a href="/donate">บริจาคประสบการณ์</a> ที่เราเคยผ่านเรื่องแย่ๆ ไปได้ พี่${botName}จะเป็นตัวกลางส่งต่อประสบการณ์ของน้องให้เพื่อนๆ ที่เจอปัญหาคล้ายๆ กัน (ปล. บริจาคแล้วได้ประกาศนียบัตรจิตอาสาบริจาคประสบการณ์ จาก สสส. ด้วยนะ)`, 
            `น้องสามารถคุยกับพี่${botName}ใหม่ได้ตลอดเวลา เพียงกด "เริ่มคุยใหม่" ด้านขวามือ หรือโหลดหน้านี้ใหม่`
        ]

        convRes()
    } else if (reqInput.match(regexLove) != null) {
        reqRes = [
            'พี่เข้าใจนะ ช่วงเวลาวัยรุ่นอย่างเราเป็นช่วงที่ความรักเป็นเรื่องสำคัญมาก บางคนถึงขั้นกินไม่ได้ นอนไม่หลับ เพราะคิดถึงแต่เค้าตลอดเลย แต่เรารู้มั๊ย พี่ๆ นักวิจัยเค้าออกมาบอกเลยนะว่า ความทุกข์ที่เกิดขึ้นในตอนนี้จะมีผลน้อยมากๆ กับเราในอีก 3 เดือนข้างหน้า ซึ่งแปลว่าไม่ว่าตอนนี้เราจะอกหัก ปวดใจแค่ไหนก็ตาม มันก็เกิดขึ้นแค่ชั่วคราว แล้วมันก็จะหายไปในเวลาไม่ช้านี้ ยังไงพี่ก็เป็นกำลังใจให้น้า 🙂', 
            `ลองเล่าสั้นๆ ว่าน้องมีปัญหาความรักเรื่องอะไร พี่${botName}จะไปดึงวิธีการรับมือของเพื่อนๆ คนอื่นๆ ที่เคยเจอเรื่องคล้ายๆ กันมาให้นะ<br><span class="help-text">ตัวอย่าง <em>อยากมีแฟน</em>, <em>แอบชอบ</em>, <em>ชอบเค้าฝ่ายเดียว</em>, <em>ชอบคนมีเจ้าของ</em>, <em>แฟนนอกใจ</em>, <em>แฟนบอกเลิก</em></span>`
        ]

        convRes()
    } else if (reqInput.match(regexStudy) != null) {
        reqRes = [
            'อาจมีบางวิชาที่เรารู้สึกไม่ชอบ หรือรู้สึกว่าไม่เข้าใจ แต่พี่ก็มีเคล็ดลับเกี่ยวกับการเรียนในแบบต่างๆ มาให้ลองอ่านกันนะ', 
            `ลองเล่าสั้นๆ ว่าน้องมีปัญหาอะไรเรื่องเรียน พี่${botName}จะไปดึงวิธีการรับมือของเพื่อนๆ คนอื่นๆ ที่เคยเจอเรื่องคล้ายๆ กันมาให้นะ<br><span class="help-text">ตัวอย่าง <em>เกรดไม่ดี</em>, <em>เรียนไม่ทัน</em>, <em>ความจำไม่ดี</em>, <em>เรียนต่อ</em>, <em>ทุนการศึกษา</em></span>`
        ]

        convRes()
    } else if (reqInput.match(regexFriend) != null) {
        reqRes = [
            'เป็นเรื่องปกติที่วัยรุ่นอย่างเราๆ จะมีปัญหากับเพื่อนเนอะ เพราะเราใช้เวลาไปไม่น้อยอยู่กับเพื่อน แม้แต่ตอนนั่งเม้ามอยเหล่สาวส่องหนุ่มด้วยกัน เมื่อเราใช้เวลาอยู่กับใครมากๆ เข้า ก็เป็นเรื่องธรรมดาที่จะเกิดความไม่เข้าใจกัน พี่อยากแนะนำให้น้องหายใจเข้าลึ้กลึกก่อนแปปนึง แล้วพี่จะเป็นเพื่อนที่ดีให้น้องเอง', 
            `ลองเล่าสั้นๆ ว่าน้องมีปัญหาอะไรเรื่องเพื่อน พี่${botName}จะไปดึงวิธีการรับมือของเพื่อนๆ คนอื่นๆ ที่เคยเจอเรื่องคล้ายๆ กันมาให้นะ<br><span class="help-text">ตัวอย่าง <em>โดนเพื่อนแกล้ง</em>, <em>ถูกบูลลี่</em>, <em>ทะเลาะกับเพื่อน</em>, <em>เข้ากับเพื่อนไม่ได้</em></span>`
        ]

        convRes()
    } else if (reqInput.match(regexSelf) != null) {
        reqRes = [
            'พี่แนะนำให้คิดบวก และให้กำลังใจตัวเองเยอะๆ ถ้าเหนื่อยก็พักเยอะๆ นะ', 
            'บางทีการลุกขึ้นมาให้รางวัลตัวเองหรือทำเรื่องดีๆ ให้กับตัวเองบ้างก็ได้นะ วิธีการคือ ลองตั้งเป้าหมายไว้ ในเรื่องไม่ยากและไม่ง่ายจนเกินไป ถ้าทำสำเร็จก็ให้รางวัลตัวเองบ้าง ให้รางวัลสำหรับความอดทน ให้รางวัลสำหรับการมีวินัย โดยที่เราไม่ต้องรอใครมาชม เราก็ภูมิใจด้วยตนเองได้นะ', 
            `ลองเล่าสั้นๆ ว่าน้องมีปัญหากับตัวเองเรื่องอะไร พี่${botName}จะไปดึงวิธีการรับมือของเพื่อนๆ คนอื่นๆ ที่เคยเจอเรื่องคล้ายๆ กันมาให้นะ<br><span class="help-text">ตัวอย่าง <em>ไม่อยากอยู่ต่อไปแล้ว</em>, <em>นอนไม่หลับ</em>, <em>ไม่ชอบรูปร่างหน้าตา</em>, <em>ชีวิตไม่ดีเท่าคนอื่น</em>, <em>ติดเกม</em></span>`
        ]

        convRes()
    } else if (reqInput.match(regexThinking) != null) {
        reqRes = [
            'น้องเคยคิดมั๊ยว่าสาเหตุที่เราเศร้า หดหู่สุดๆ จริงๆ แล้วเป็นเพราะความคิดในแง่ลบของเราต่างหากนะ เรามักจะแต่งเรื่องให้ทุกอย่างดูแย่เกินความเป็นจริง หรือคิดถึงเรื่องเก่าๆ ที่ทำให้ช้ำใจ ซ้ำแล้วซ้ำอีก และคนส่วนใหญ่เวลาที่คิดลบ ก็มักจะไม่รู้ตัวว่ากำลังทำร้ายตัวเองอยู่ด้วยความคิดไม่ดีที่ดูเหมือนจะเป็นจริง (มากกก)', 
            `ลองเล่าสั้นๆ ว่าน้องมีความคิดความรู้สึกเรื่องอะไรที่เป็นปัญหา พี่${botName}จะไปดึงวิธีการรับมือของเพื่อนๆ คนอื่นๆ ที่เคยเจอเรื่องคล้ายๆ กันมาให้นะ<br><span class="help-text">ตัวอย่าง <em>เครียด</em>, <em>คิดมาก</em>, <em>ซึมเศร้า</em></span>`
        ]

        convRes()
    } else if (reqInput.match(regexFinance) != null) {
        reqRes = [
            'ปัญหานี้เป็นปัญหาที่น้องๆ หลายคนเจออยู่ แต่อย่าพึ่งท้อใจไปนะคะ ความลำบากในวันนี้ จะสอนให้เราเป็นคนแกร่งขึ้นในวันข้างหน้านะ ถ้าวันนี้เราผ่านมันไปได้', 
            `ลองเล่าสั้นๆ ว่าน้องมีปัญหาการเงินเรื่องอะไร พี่${botName}จะไปดึงวิธีการรับมือของเพื่อนๆ คนอื่นๆ ที่เคยเจอเรื่องคล้ายๆ กันมาให้นะ<br><span class="help-text">ตัวอย่าง <em>เงินไม่พอใช้</em>, <em>ไม่มีเงินเรียน</em>, <em>ทุนการศึกษา</em>, <em>หางาน</em></span>`
        ]

        convRes()
    } else if (reqInput.match(regexFamily) != null) {
        reqRes = [
            'เมื่อเราไม่สามารถเลือกได้ว่าจะเกิดในครอบครัวแบบไหน สิ่งหนึ่งที่เราทำได้คือเปลี่ยนมุมมอง คิดในแง่บวก แล้วเราจะมีความสุขมากขึ้น', 
            `ลองเล่าสั้นๆ ว่าน้องมีปัญหากับที่บ้านเรื่องอะไร พี่${botName}จะไปดึงวิธีการรับมือของเพื่อนๆ คนอื่นๆ ที่เคยเจอเรื่องคล้ายๆ กันมาให้นะ<br><span class="help-text">ตัวอย่าง <em>พ่อแม่ไม่รับฟัง</em>, <em>เป็น LGBT</em>, <em>ทะเลาะกับที่บ้าน</em>, <em>โดนเปรียบเทียบ</em>, <em>พ่อแม่ลำเอียง</em>, <em>พ่อแม่แยกทาง</em>, <em>พ่อแม่ไม่มีเวลา</em>, <em>ถูกทำร้าย</em></span>`
        ]

        convRes()
    } else {  // Fetch search back-end
        // Add response thinking bubble while waiting for response
        // To remove when getting fetch response
        const childNodeBubble = document.createElement('div')
        const childNodeBubbleClear = document.createElement('div')
        
        childNodeBubble.setAttribute('id', 'resBubble')
        childNodeBubble.setAttribute('class', 'conv-res-bubble')
        botConv.appendChild(childNodeBubble)
        document.getElementById('resBubble').innerHTML = `
            <div class="res-bubble"></div>
            <div class="res-bubble"></div>
            <div class="res-bubble"></div>
        `

        childNodeBubbleClear.setAttribute('id', 'resBubbleClear')
        childNodeBubbleClear.setAttribute('class', 'clear')
        botConv.appendChild(childNodeBubbleClear)

        // Scroll the botConv div into view
        childNodeBubbleClear.scrollIntoView()

        // Prep intervention flag if any
        if (reqInput.match(regexSuicide) != null) {
            interventionFlag = 'suicide'
        }

        fetchSearch(reqInput)
    }
}

// Special function to add resLengthCycle count
function convResCont() {
    // Trigger when clicking Continue button to add 1
    // to resLengthCycle count
    resLengthCycle += 1

    convRes()
}

// Special function to add Continue button
function convAddCont() {
    // Add Continue button at the end ONLY when there's at least
    // one resLengthLimit entries left
    if (resLengthLimit*resLengthCycle <= reqRes.length-resLengthLimit) {
        setTimeout(function() {
            const childNode = document.createElement('div')
            const childNodeClear = document.createElement('div')
            
            childNode.setAttribute('id', convNum+1)
            childNode.setAttribute('class', 'conv-res')
            botConv.appendChild(childNode)
            document.getElementById(`${convNum+1}`).innerHTML = `
                <div class="rich-response">
                    <button id="resCont" class="req-rich" onclick="convResCont()">ดูเพิ่ม</button>
                    <button id="resCont" class="req-rich" onclick="convReq('พอแค่นี้')">พอแค่นี้</button>
                </div>
            `
        
            childNodeClear.setAttribute('class', 'clear')
            botConv.appendChild(childNodeClear)

            // Scroll the botConv div into view and to the bottom
            childNodeClear.scrollIntoView()
        
            // Push this conv into convLog
            convLog.push({
                convId: convNum+1, 
                time: Date.now(), 
                side: 'bot', 
                message: 'next'
            })

            convNum += 1
        }, resDelay)
    }
}

// Special function to add intervention info when intervention flag is set
function convAddIntervention(flag) {
    // Add related Intervention box at the beginning
    setTimeout(function() {
        const childNode = document.createElement('div')
        const childNodeClear = document.createElement('div')
        
        childNode.setAttribute('id', convNum+1)
        childNode.setAttribute('class', 'conv-res-intervention')
        botConv.appendChild(childNode)

        if (flag == 'suicide') {
            document.getElementById(`${convNum+1}`).innerHTML = `    
                พี่ใจดีรวบรวมหน่วยงานผู้เชี่ยวชาญที่ช่วยน้องได้มาให้แล้วตามนี้เลย
                <ul>
                    <li>สายด่วน 1323 ของกรมสุขภาพจิต ผู้ที่ให้คำปรึกษาส่วนใหญ่เป็นนักจิตวิทยา นักสังคมสงเคราะห์ พยาบาลวิชาชีพ</li>
                    <li>สายด่วน Depress We Care โรงพยาบาลตำรวจ โทร. 081-932-0000</li>
                    <li>สมาคมสะมาริตันส์แห่งประเทศไทย โทร. 02-713-6793 ทุกวัน ตั้งแต่เวลา 12.00-22.00 น.</li>
                    <li>หรือรีบไปเข้าขอรับคำปรึกษาและรักษาจากจิตแพทย์โรงพยาบาลใกล้ตัวน้องโดยเร็วที่สุดเลยนะ</li>
                </ul>
                พี่ใจดีเป็นห่วงมากจ๊ะ            
            `
        }
    
        childNodeClear.setAttribute('class', 'clear')
        botConv.appendChild(childNodeClear)

        // Scroll the botConv div into view and to the bottom
        childNodeClear.scrollIntoView()
    
        // Push this conv into convLog
        convLog.push({
            convId: convNum+1, 
            time: Date.now(), 
            side: 'bot', 
            message: 'intervention: ' + flag
        })

        convNum += 1

        // Disable intevention notice after noticed once
        interventionFlag = ''
    }, 0)
}

// Special function to add notice when loose mode is on
function convAddNotice() {
    // Add Notice box at the beginning ONLY when first result item 
    // is loose mode (mode = 2)
    setTimeout(function() {
        const childNode = document.createElement('div')
        const childNodeClear = document.createElement('div')
        
        childNode.setAttribute('id', convNum+1)
        childNode.setAttribute('class', 'conv-res-notice')
        botConv.appendChild(childNode)
        document.getElementById(`${convNum+1}`).innerHTML = `
            พี่${botName}ไปค้นหาแล้วยังไม่พบข้อมูลที่ใกล้เคียงกับเรื่องที่น้องพิมพ์มา ลองพิมพ์เรื่องอื่นมาได้นะ หรือลองพิมพ์ใหม่โดยเปลี่ยนคำหรือใช้ประโยคที่สั้นลง
        `
    
        childNodeClear.setAttribute('class', 'clear')
        botConv.appendChild(childNodeClear)

        // Scroll the botConv div into view and to the bottom
        childNodeClear.scrollIntoView()
    
        // Push this conv into convLog
        convLog.push({
            convId: convNum+1, 
            time: Date.now(), 
            side: 'bot', 
            message: 'loose mode notice'
        })

        convNum += 1

        // Disable loose mode notice after noticed once
        searchMode = 1
    }, 0)
}

// Display the response
function convRes() {
    const botConv = document.getElementById('botConv')

    // // Focus chatbot input box
    // document.getElementById('reqInput').focus()

    // Add intervention info if intervention flag is not empty
    if (interventionFlag == 'suicide') {
        convAddIntervention('suicide')
    }

    // Add loose mode notice if first result item mode is loose (2)
    if (searchMode == 2) {
        convAddNotice()
    }

    // Check length of reqRes array
    // If > 5, limit the response from slice 0-5
    if (reqRes.length >= resLengthLimit*resLengthCycle) {
        reqRes.slice((resLengthLimit*resLengthCycle)-3, resLengthLimit*resLengthCycle).forEach((i, index ) => {
            // Reset resLengthProcessed
            resLengthProcessed = 0

            // Loop over reqRes with time interval
            setTimeout(function() {  // Create a delay between each iteration
                const childNode = document.createElement('div')
                const childNodeClear = document.createElement('div')
                
                childNode.setAttribute('id', convNum+1)
                childNode.setAttribute('class', 'conv-res')
                botConv.appendChild(childNode)
                document.getElementById(`${convNum+1}`).innerHTML = i
            
                childNodeClear.setAttribute('class', 'clear')
                botConv.appendChild(childNodeClear)
    
                // Scroll the botConv div into view and to the bottom
                childNodeClear.scrollIntoView()
            
                // Push this conv into convLog
                convLog.push({
                    convId: convNum+1, 
                    time: Date.now(), 
                    side: 'bot', 
                    message: i
                })
    
                convNum += 1

                // Add 1 to resLengthProcessed then trigger Continue button
                // ONLY if the last item is processed given resLengthLimit
                resLengthProcessed += 1

                if (resLengthProcessed == resLengthLimit) {
                    convAddCont()
                }
            }, index*resDelay)
            // Each iteration needs loop time to add up, 
            // because JS run loops asynchronuously
        })
    } else {
        reqRes.forEach((i, index ) => {
            setTimeout(function() {  // Create a delay between each iteration
                const childNode = document.createElement('div')
                const childNodeClear = document.createElement('div')
                
                childNode.setAttribute('id', convNum+1)
                childNode.setAttribute('class', 'conv-res')
                botConv.appendChild(childNode)
                document.getElementById(`${convNum+1}`).innerHTML = i
            
                childNodeClear.setAttribute('class', 'clear')
                botConv.appendChild(childNodeClear)
    
                // Scroll the botConv div into view and to the bottom
                childNodeClear.scrollIntoView()
            
                // Push this conv into convLog
                convLog.push({
                    convId: convNum+1, 
                    time: Date.now(), 
                    side: 'bot', 
                    message: i
                })
    
                convNum += 1
                }, index*resDelay)
        })
    }

    // console.log('Conversation log:')
    // console.log(convLog)
}

// Submit the input
function reqSubmit() {
    const textInput = document.getElementById('reqInput')

    reqInput = document.getElementById('reqInput').value

    if (reqInput.length > 1) {  // Prevent too short submit
        textInput.value = ''

        convReq(reqInput)
    }
}

// Add Enter key listener
document.getElementById('reqInput').addEventListener('keyup', e => {
    if (e.key == "Enter") {
        e.preventDefault()
        reqSubmit()
    }
})

// Start conversation when loaded
window.onload = convStart()