console.log('Search activated')

//
// SEARCHBOX PART
//

const searchInput = document.getElementById('searchBox')

// Focus on search box
searchInput.focus()

// Add Enter key listener
searchInput.addEventListener('keyup', e => {
    if (e.key == "Enter") {
        e.preventDefault()
        searchSubmit()
    }
})

let searchObj = []
let searchArray = []

// Fetch search content
function fetchSearch() {
    fetch('/search/api')
    .then(response => response.json())
    .then(data => {
        searchObj = data
        console.log('Get Object: ', searchObj)

        // Enable main-wrapper and search UI when JSON is loaded
        searchBox.disabled = false
        document.getElementById('mainWrapper').style.opacity = '1'
    })
    .catch((error) => {
        console.error('Error: ', error);
    })
}

fetchSearch()

function searchSubmit() {
    // Clear search result DOM first
    const searchResult = document.getElementById('searchResult')
    searchResult.innerHTML = ''

    // Check if filterObj is empty or not
    console.log(Object.values(filterObj))

    let filterObjValCount = 0

    Object.values(filterObj).forEach(i => {
        filterObjValCount += i.length
    })

    // Check normal mode or filtered mode
    if (filterObjValCount === 0) {  // No filter, use normal mode
        console.log('Search using NORMAL mode')

        // Proceed if input length > 1 only
        if (searchInput.value.length > 1) {
            // Sanitise search term
            const searchTermRaw = searchInput.value
            let searchTermAnd = ''
            let searchTermOr = ''
            const searchTermCleanupRegex = /\s/g;  // All whitespace

            searchTermAnd = searchTermRaw.replace(searchTermCleanupRegex, '.*')
            searchTermOr = searchTermRaw.replace(searchTermCleanupRegex, '|')

            console.log(`Search term strict mode (AND): ${searchTermAnd}`)
            console.log(`Search term loose mode (OR): ${searchTermOr}`)

            // Build search RegEx
            let searchRegexAnd = new RegExp(searchTermAnd, 'gi')
            let searchRegexOr = new RegExp(searchTermOr, 'gi')

            console.log(`Search Regex strict mode (AND): ${searchRegexAnd}`)
            console.log(`Search Regex loose mode (OR): ${searchRegexOr}`)

            // Reset search array which is the result array of target objects
            // First, iterate over objects in searchObj array
            searchArray = []

            // Search using strict mode first
            searchObj.forEach((obj, i) => {
                // Then iterate over each object and test regex match
                for (const [key, value] of Object.entries(obj)) {
                    if (key == 'topic') {
                        if (String(value).match(searchRegexAnd) != null) {
                            // Calculate search ranking (num of combined occurrences of search term)
                            let termMatchNum = 0

                            termMatchNum = String(value).match(searchRegexAnd).length

                            // Create search result array of objects
                            searchArray.push({
                                obj: searchObj[i], 
                                matchNum: termMatchNum, 
                                mode: 'strict'
                            })
                        }
                    }   
                }
            })

            // If strict mode doesn't return any value, reapply using loose mode
            if (searchArray.length == 0) {
                searchObj.forEach((obj, i) => {
                    // Then iterate over each object and test regex match
                    for (const [key, value] of Object.entries(obj)) {
                        if (key == 'topic') {
                            if (String(value).match(searchRegexOr) != null) {
                                // Calculate search ranking (num of combined occurrences of search term)
                                let termMatchNum = 0
            
                                termMatchNum = String(value).match(searchRegexOr).length
            
                                // Create search result array of objects
                                searchArray.push({
                                    obj: searchObj[i], 
                                    matchNum: termMatchNum, 
                                    mode: 'loose'
                                })
                            }
                        }   
                    }
                })
            }

            // Sort the search result array by matchNum
            // We want results with high occurrences to appear first
            searchArray.sort((a, b) => b.matchNum - a.matchNum)

            console.log(searchArray)
            
            // Update searchResultNum
            const searchResultNum = document.getElementById('searchResultNum')
            searchResultNum.innerHTML = String(searchArray.length)

            console.log(searchArray.length)

            // If using loose mode, reveal loose mode notice
            if (searchArray.length > 0) {
                if (searchArray[0].mode == 'loose') {
                    document.getElementById('searchLooseModeNotice').style.display = 'inline-block'
                } else {
                    document.getElementById('searchLooseModeNotice').style.display = 'none'
                }
            }

            // Append each result to DOM
            if (searchArray.length > 0) {
                if (searchArray.length > 10) {  // If result length > 10, add 'more' button
                    searchArray.forEach((result, index) => {
                        if (index < 10) {
                            // Append each result to DOM
                            const searchResultItemDiv = document.createElement('div')
        
                            searchResultItemDiv.setAttribute('id', `searchResult${index}`)
                            searchResultItemDiv.setAttribute('class', 'search-result-item')
                            searchResult.appendChild(searchResultItemDiv)
        
                            const searchResultItem = document.getElementById(`searchResult${index}`)
                            searchResultItem.innerHTML = `
                                <p class="gray-small">เพศ ${ result.obj.gender } | อายุ ${ result.obj.age } ปี | จังหวัด ${ result.obj.area }</p>
                                <p><span class="red-em">ปัญหา:</span> <strong>${ result.obj.topic}</strong></p>
                                <p><span class="blue-em">ทางแก้ไข:</span> ${ result.obj.solution}</p>
                            `
                        }
                    })

                    // Append 'more' button
                    const searchResultMoreButton = document.createElement('button')

                    searchResultMoreButton.setAttribute('id', 'searchResultMore')
                    searchResultMoreButton.setAttribute('class', 'search-more-button')
                    searchResultMoreButton.setAttribute('onclick', 'searchMore()')

                    searchResult.appendChild(searchResultMoreButton)

                    document.getElementById('searchResultMore').innerHTML = 'ดูเพิ่ม'

                } else {  // If result length < 10, display all items
                    searchArray.forEach((result, index) => {
                        // Append each result to DOM
                        const searchResultItemDiv = document.createElement('div')
    
                        searchResultItemDiv.setAttribute('id', `searchResult${index}`)
                        searchResultItemDiv.setAttribute('class', 'search-result-item')
                        searchResult.appendChild(searchResultItemDiv)
    
                        const searchResultItem = document.getElementById(`searchResult${index}`)
                        searchResultItem.innerHTML = `
                            <p class="gray-small">เพศ ${ result.obj.gender } | อายุ ${ result.obj.age } ปี | จังหวัด ${ result.obj.area }</p>
                            <p><span class="red-em">ปัญหา:</span> <strong>${ result.obj.topic}</strong></p>
                            <p><span class="blue-em">ทางแก้ไข:</span> ${ result.obj.solution}</p>
                        `
                    })
                }
                
            }
            
            // // Optionally clear search box
            // searchInput.value = ''

            // Refocus the search box
            searchInput.focus()
        } else {  // If search input length < 1
            // Clear search result num
            searchResultNum.innerHTML = '0'
        }
    } else {  // If filterArray length > 0, use filtered mode
        console.log('Search using FILTER mode')

        // Sanitise search term
        const searchTermRaw = searchInput.value
        let searchTermAnd = ''
        let searchTermOr = ''
        const searchTermCleanupRegex = /\s/g;  // All whitespace

        searchTermAnd = searchTermRaw.replace(searchTermCleanupRegex, '.*')
        searchTermOr = searchTermRaw.replace(searchTermCleanupRegex, '|')

        console.log(`Search term strict mode (AND): ${searchTermAnd}`)
        console.log(`Search term loose mode (OR): ${searchTermOr}`)

        // Build search RegEx
        let searchRegexAnd = new RegExp(searchTermAnd, 'gi')
        let searchRegexOr = new RegExp(searchTermOr, 'gi')

        console.log(`Search Regex strict mode (AND): ${searchRegexAnd}`)
        console.log(`Search Regex loose mode (OR): ${searchRegexOr}`)

        // Reset search array which is the result array of target objects
        // First, iterate over objects in searchObj array
        searchArray = []

        // Search using strict mode first
        searchObjFiltered.forEach((obj, i) => {
            // Then iterate over each object and test regex match
            for (const [key, value] of Object.entries(obj)) {
                if (key == 'topic') {
                    if (String(value).match(searchRegexAnd) != null) {
                        // Calculate search ranking (num of combined occurrences of search term)
                        let termMatchNum = 0

                        termMatchNum = String(value).match(searchRegexAnd).length

                        // Create search result array of objects
                        searchArray.push({
                            obj: searchObjFiltered[i], 
                            matchNum: termMatchNum, 
                            mode: 'strict'
                        })
                    }
                }   
            }
        })

        // If strict mode doesn't return any value, reapply using loose mode
        if (searchArray.length == 0) {
            searchObjFiltered.forEach((obj, i) => {
                // Then iterate over each object and test regex match
                for (const [key, value] of Object.entries(obj)) {
                    if (key == 'topic') {
                        if (String(value).match(searchRegexOr) != null) {
                            // Calculate search ranking (num of combined occurrences of search term)
                            let termMatchNum = 0
        
                            termMatchNum = String(value).match(searchRegexOr).length
        
                            // Create search result array of objects
                            searchArray.push({
                                obj: searchObjFiltered[i], 
                                matchNum: termMatchNum, 
                                mode: 'loose'
                            })
                        }
                    }   
                }
            })
        }

        // Sort the search result array by matchNum
        // We want results with high occurrences to appear first
        searchArray.sort((a, b) => b.matchNum - a.matchNum)

        console.log(searchArray)
        
        // Update searchResultNum
        const searchResultNum = document.getElementById('searchResultNum')
        searchResultNum.innerHTML = String(searchArray.length)

        console.log(searchArray.length)

        // If using loose mode, reveal loose mode notice
        if (searchArray[0].mode == 'loose') {
            document.getElementById('searchLooseModeNotice').style.display = 'inline-block'
        } else {
            document.getElementById('searchLooseModeNotice').style.display = 'none'
        }

        // Append each result to DOM
        if (searchArray.length > 0) {
            if (searchArray.length > 10) {  // If result length > 10, add 'more' button
                searchArray.forEach((result, index) => {
                    if (index < 10) {
                        const searchResultItemDiv = document.createElement('div')

                        searchResultItemDiv.setAttribute('id', `searchResult${index}`)
                        searchResultItemDiv.setAttribute('class', 'search-result-item')
                        searchResult.appendChild(searchResultItemDiv)
            
                        const searchResultItem = document.getElementById(`searchResult${index}`)
                        searchResultItem.innerHTML = `
                            <p class="gray-small">เพศ ${ result.obj.gender } | อายุ ${ result.obj.age } ปี | จังหวัด ${ result.obj.area }</p>
                            <p><span class="red-em">ปัญหา:</span> <strong>${ result.obj.topic}</strong></p>
                            <p><span class="blue-em">ทางแก้ไข:</span> ${ result.obj.solution}</p>
                        `
                    }
                })

                // Append 'more' button
                const searchResultMoreButton = document.createElement('button')

                searchResultMoreButton.setAttribute('id', 'searchResultMore')
                searchResultMoreButton.setAttribute('class', 'search-more-button')
                searchResultMoreButton.setAttribute('onclick', 'searchMore()')

                searchResult.appendChild(searchResultMoreButton)

                document.getElementById('searchResultMore').innerHTML = 'ดูเพิ่ม'

            } else { // If result length < 10, display all items
                searchArray.forEach((result, index) => {
                    // Append each result to DOM
                    const searchResultItemDiv = document.createElement('div')

                    searchResultItemDiv.setAttribute('id', `searchResult${index}`)
                    searchResultItemDiv.setAttribute('class', 'search-result-item')
                    searchResult.appendChild(searchResultItemDiv)

                    const searchResultItem = document.getElementById(`searchResult${index}`)
                    searchResultItem.innerHTML = `
                        <p class="gray-small">เพศ ${ result.obj.gender } | อายุ ${ result.obj.age } ปี | จังหวัด ${ result.obj.area }</p>
                        <p><span class="red-em">ปัญหา:</span> <strong>${ result.obj.topic}</strong></p>
                        <p><span class="blue-em">ทางแก้ไข:</span> ${ result.obj.solution}</p>
                    `
                })
            }
        }

        // // Optionally clear search box
        // searchInput.value = ''

        // Refocus the search box
        searchInput.focus()
    }
}

function searchMore() {
    console.log('search more')

    // Determine number of all shown result item
    const resultCount = searchResult.childElementCount

    console.log(resultCount)

    // Remove 'more' button
    document.getElementById('searchResultMore').remove()

    // Append more search result to DOM
    searchArray.forEach((result, index) => {
        if (index > resultCount-2 && index < resultCount+9) {  // Show 10 more items
            // Append each result to DOM
            const searchResultItemDiv = document.createElement('div')

            searchResultItemDiv.setAttribute('id', `searchResult${index}`)
            searchResultItemDiv.setAttribute('class', 'search-result-item')
            searchResult.appendChild(searchResultItemDiv)

            const searchResultItem = document.getElementById(`searchResult${index}`)
            searchResultItem.innerHTML = `
                <p class="gray-small">เพศ ${ result.obj.gender } | อายุ ${ result.obj.age } ปี | จังหวัด ${ result.obj.area }</p>
                <p><span class="red-em">ปัญหา:</span> <strong>${ result.obj.topic}</strong></p>
                <p><span class="blue-em">ทางแก้ไข:</span> ${ result.obj.solution}</p>
            `
        }
    })

    // Append 'more' button
    if (searchArray.length - resultCount - 1 > 10) {  // If there's > 10 more results to show
        const searchResultMoreButton = document.createElement('button')

        searchResultMoreButton.setAttribute('id', 'searchResultMore')
        searchResultMoreButton.setAttribute('class', 'search-more-button')
        searchResultMoreButton.setAttribute('onclick', 'searchMore()')

        searchResult.appendChild(searchResultMoreButton)

        document.getElementById('searchResultMore').innerHTML = 'ดูเพิ่ม'
    }
}

function searchClear() {
    // Clear search input value
    searchInput.value = ''

    // Clear search result num
    searchResultNum.innerHTML = '0'

    // Clear filter object and checkboxes
    filterObj = {
        gender: [], 
        age: [], 
        province: []
    }

    genderMale.checked = false
    genderFemale.checked = false
    genderOther.checked = false
    age1.checked = false
    age2.checked = false
    age3.checked = false
    provinceBkk.checked = false
    provinceNoneBkk.checked = false

    // Call filterSearch with empty search input
    filterSearch()
}

//
// SEARCH FILTER PART
//

const genderMale = document.getElementById('genderMale')
const genderFemale = document.getElementById('genderFemale')
const genderOther = document.getElementById('genderOther')
const age1 = document.getElementById('age1')
const age2 = document.getElementById('age2')
const age3 = document.getElementById('age3')
const provinceBkk = document.getElementById('provinceBkk')
const provinceNoneBkk = document.getElementById('provinceNoneBkk')

let filterObj = {  // Init an object to hold filter values
    gender: [], 
    age: [], 
    province: []
}

// Add click listener
genderMale.addEventListener('click', e => {
    const filterKey = 'gender'

    filterPrep(filterKey, genderMale.value)
})

genderFemale.addEventListener('click', e => {
    const filterKey = 'gender'

    filterPrep(filterKey, genderFemale.value)
})

genderOther.addEventListener('click', e => {
    const filterKey = 'gender'

    filterPrep(filterKey, genderOther.value)
})

age1.addEventListener('click', e => {
    const filterKey = 'age'

    filterPrep(filterKey, age1.value) 
})

age2.addEventListener('click', e => {
    const filterKey = 'age'

    filterPrep(filterKey, age2.value)
})

age3.addEventListener('click', e => {
    const filterKey = 'age'

    filterPrep(filterKey, age3.value)
})

provinceBkk.addEventListener('click', e => {
    const filterKey = 'province'

    filterPrep(filterKey, provinceBkk.value)
})

provinceNoneBkk.addEventListener('click', e => {
    const filterKey = 'province'

    filterPrep(filterKey, provinceNoneBkk.value)
})

// Filter add/remove functions
function filterPrep(filterKey, choice) {
    const checkedDom = document.querySelectorAll(`input[name="${filterKey}"]:checked`)
    let valueArray = []

    checkedDom.forEach(i => {
        valueArray.push(i.value)
    })

    filterObj[filterKey] = valueArray
    

    console.log(`Add: ${choice}`)
    console.log(filterObj)

    filterSearch()
}

// Filter-search function
let searchObjFiltered = []  // Init searchObjFiltered to be filled with filtered searchObj

function filterSearch() {
    // Clear searchObjFiltered
    searchObjFiltered = []

    // Create key check
    let genderCheck = false
    let ageCheck = false
    let provinceCheck = false

    for (const [key, value] of Object.entries(filterObj)) {
        if (key === 'gender') {
            if (value.length !== 0) {
                genderCheck = true
            }
        }

        if (key === 'age') {
            if (value.length !== 0) {
                ageCheck = true
            }
        }

        if (key === 'province') {
            if (value.length !== 0) {
                provinceCheck = true
            }
        }
    }

    // CASE 0: None is checked
    if (genderCheck === false && ageCheck === false && provinceCheck === false) {

    } else {  // CASE 1: Some are checked
        // Stage 1: filter GENDER first
        let searchObjFilteredGender = []
        let searchObjFilteredAge = []

        if (genderCheck === false) {
            // If no gender is checked, it means ALL is checked, 
            // so assign searchObj to search object of this stage
            searchObjFilteredGender = searchObj
        } else {
            for (const [filterKey, filterValue] of Object.entries(filterObj)) {
                filterValue.forEach(fValue => {
                    searchObj.forEach((obj, i) => {
                        for (const [key, value] of Object.entries(obj)) {
                            if (key === 'gender') {
                                if (value === fValue) {
                                    searchObjFilteredGender.push(searchObj[i])
                                }
                            }
                        }
                    })
                })
            }
        }

        // Stage 2: filter AGE from filtered GENDER
        if (ageCheck === false) {
            // If no gender is checked, it means ALL is checked, 
            // so assign searchObj to search object of this stage
            searchObjFilteredAge = searchObjFilteredGender
        } else {
            for (const [filterKey, filterValue] of Object.entries(filterObj)) {
                filterValue.forEach(fValue => {
                    searchObjFilteredGender.forEach((obj, i) => {
                        for (const [key, value] of Object.entries(obj)) {
                            if (key === 'age') {
                                if (Number(fValue) === 1) {  // For age range 1 (< 12)
                                    if (value < 12) {
                                        searchObjFilteredAge.push(searchObjFilteredGender[i])
                                    }
                                }
        
                                if (Number(fValue) === 2) {  // For age range 1 (12-18)
                                    if (value >= 12 && value < 18) {
                                        searchObjFilteredAge.push(searchObjFilteredGender[i])
                                    }
                                }
        
                                if (Number(fValue) === 3) {  // For age range 3 (> 18)
                                    if (value >= 18) {
                                        searchObjFilteredAge.push(searchObjFilteredGender[i])
                                    }
                                }
                            }
                        }
                    })
                })
            }
        }

        // Stage 3: filter PROVINCE from filtered AGE
        if (provinceCheck === false) {
            // If no gender is checked, it means ALL is checked, 
            // so assign searchObj to search object of this stage
            searchObjFiltered = searchObjFilteredAge
        } else {
            for (const [filterKey, filterValue] of Object.entries(filterObj)) {
                filterValue.forEach(fValue => {
                    searchObjFilteredAge.forEach((obj, i) => {
                        for (const [key, value] of Object.entries(obj)) {
                            if (key === 'area') {
                                if (fValue === 'กทม.') {
                                    if (value === 'กทม.') {
                                        searchObjFiltered.push(searchObjFilteredAge[i])
                                    }
                                }

                                if (fValue === 'นอกกทม.') {
                                    if (value !== 'กทม.') {
                                        searchObjFiltered.push(searchObjFilteredAge[i])
                                    }
                                }
                            }
                        }
                    })
                })
            }
        }
    }

    // console.log(`searchObjFiltered: ${searchObjFiltered}`)
    console.log(`searchObjFiltered len: ${searchObjFiltered.length}`)

    // Call main search function
    searchSubmit()
}

//
// ONLOAD PART
//

window.onload = loadInit()

function loadInit() {
    // Clear search input box
    searchInput.value = ''

    // Clear all filter checkboxes
    genderMale.checked = false
    genderFemale.checked = false
    genderOther.checked = false
    age1.checked = false
    age2.checked = false
    age3.checked = false
    provinceBkk.checked = false
    provinceNoneBkk.checked = false

    // Disable main-wrapper and search UI until JSON is loaded
    searchBox.disabled = true
    document.getElementById('mainWrapper').style.opacity = '0.5'
}