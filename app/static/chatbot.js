// Get csrf token from Flask backend
const csrfToken = document.getElementById('csrf').firstChild.value

// Declare global scope variables
const resDelay = 700  // Delay in ms for each round of response
const resLengthLimit = 3  // Number of message to display each cycle
let resLengthCycle = 1  // Keeping track of message display cycle
let resLengthProcessed = 0  // Keeping track of processed message in each cycle
let searchMode = 1  // Search regex mode: 1 = strict, 2 = loose

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
        console.log('All search objects: ', data)

        // Set strict or loose mode according to data[0]
        if (data[0].mode == 2) {
            searchMode = 2
        } else {
            searchMode = 1
        }

        reqRes = []  // Reset reqRes array

        let pronoun = ''

        data.forEach(i => {
            if (i.result == 0) {  // If no result
                reqRes.push(
                    `
                        พี่${botName}ยังไม่มีข้อมูลที่ตรงกับที่น้องพิมพ์มา ลองพิมพ์ใหม่โดยเปลี่ยนคำหรือใช้ประโยคที่สั้นลงนะคะ
                    `
                )
            } else {  // If there's result
                if (i.gender == 'ชาย') {
                    pronoun = 'เขา'
                } else {
                    pronoun = 'เธอ'
                }
    
                reqRes.push(
                    `เพื่อน${i.gender} อายุ ${i.age} จากจังหวัด${i.area} บอกว่า${pronoun}เจอเรื่อง <span class='response-topic'>"${i.topic}"</span> ความเห็นของ${pronoun}คือ <span class='response-solution'>"${i.solution}"</span>`
                )
            }
        })

        convRes()  // Call convRes to create front-end response
    })
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
const regexThankyou = new RegExp('ขอบคุณ|ขอบใจ|hank', 'g')

// Init RegEx of intervening vocabs
const regexSuicide = new RegExp('อยากตาย|ฆ่าตัวตาย|ไม่อยากอยู่|ไม่อยากมีชีวิต|จบชีวิต', 'g')

// First conversation
function convStart() {
    const botConv = document.getElementById('botConv')
    const resGreeting = [
        '<img src="https://jaideeweb.s3.ap-southeast-1.amazonaws.com/chatbot/jaidee-botlogo.svg" alt="แชทบอทใจดี">', 
        `สวัสดีจ๊ะ ดีใจที่ได้มาคุยกัน`, 
        `หากมีเรื่องไม่สบายใจก็พิมพ์บอกพี่${botName}มาได้เลยนะ พี่จะใช้ความสามารถ AI ของพี่ไปดึงความเห็นของเพื่อนๆ ที่เค้าผ่านเรื่องนั้นมาได้แล้วออกมาให้นะ<br><span class="help-text">เรื่องที่คุยกับแชทบอทใจดีจะ <a href="/about#privacy-statement" target="_blank">เป็นความลับ</a> แชทบอทจะไม่บันทึกข้อมูลส่วนตัวและไม่รู้ว่าผู้ใช้เป็นใครนะ`, 
        `
        <div class="rich-response">
            <button id="reqStart" class="req-rich" onclick="convProcess('เริ่มคุย')">เริ่มคุย</button>
        </div>
        `
    ]
    
    resGreeting.forEach(i => {
        const childNode = document.createElement('div')
        const childNodeClear = document.createElement('div')
        
        childNode.setAttribute('id', convNum+1)
        childNode.setAttribute('class', 'conv-res')
        botConv.appendChild(childNode)
        document.getElementById(`${convNum+1}`).innerHTML = i
    
        childNodeClear.setAttribute('class', 'clear')
        botConv.appendChild(childNodeClear)
        // childNodeClear.scrollIntoView()
    
        // Push this conv into convLog
        convLog.push({
            convId: convNum+1, 
            time: Date.now(), 
            side: 'bot', 
            message: i
        })

        convNum += 1
    })
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
    console.log(`User input: (${convNum}) ${reqInput}`)
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
    if (reqInput == 'เริ่มคุย' || 
        (reqInput.match(regexGreeting) != null) || 
        reqInput == 'เริ่มใหม่') {
        // Reveal input wrapper
        document.getElementById('reqWrapper').style.display = 'block'

        // Responses
        reqRes = [ 
            `ไม่สบายใจเรื่องอะไรพิมพ์บอกพี่${botName}หน่อย<br><span class="help-text">ลองพิมพ์ <em>แอบชอบรุ่นพี่</em>, <em>เรียนไม่รู้เรื่อง</em>, <em>พ่อแม่ไม่เข้าใจ</em></span>`
        ]

        convRes()
    } else if (reqInput.match(regexThankyou) != null) {
        reqRes = [
            'ดีใจที่ได้คุยกัน', 
            `กลับมาคุยกับพี่${botName}ได้ตลอดนะ <br><span class="help-text">พิมพ์ <em>เริ่มใหม่</em> เพื่อเริ่มคุยใหม่</span>`
        ]

        convRes()
    } else {  // Fetch search back-end
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
                พี่${botName}รับฟังน้องนะ ถ้ามีความคิดว่าไม่อยากมีชีวิตอยู่ มีหลายหน่วยงานยินดีช่วยเหลือนะ ลองโทรสายด่วนกรมสุขภาพจิต เบอร์ <strong>1323</strong> ได้ตลอดเวลา พี่เป็นกำลังใจให้เสมอ
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
            พี่${botName}ไปค้นหาแล้วยังไม่พบข้อมูลทีใกล้เคียงกับเรื่องที่น้องพิมพ์มา ลองพิมพ์เรื่องอื่นมาได้นะ หรือลองพิมพ์ใหม่โดยเปลี่ยนคำหรือใช้ประโยคที่สั้นลง
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

    // Focus chatbot input box
    document.getElementById('reqInput').focus()

    console.log('Conversation log:')
    console.log(convLog)
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