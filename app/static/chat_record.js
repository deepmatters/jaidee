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
    fetch('/chat_record/api')
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
                    if (key == 'searchTerm') {
                        if (String(value).match(searchRegexAnd) != null) {
                            // Calculate search ranking (num of combined occurrences of search term)
                            let termMatchNum = 0

                            termMatchNum = String(value).match(searchRegexAnd).length

                            // Create search result array of objects
                            searchArray.push({
                                obj: searchObj[i], 
                                datetime: searchObj[i]['datetime'], 
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
                        if (key == 'searchTerm') {
                            if (String(value).match(searchRegexOr) != null) {
                                // Calculate search ranking (num of combined occurrences of search term)
                                let termMatchNum = 0
            
                                termMatchNum = String(value).match(searchRegexOr).length
            
                                // Create search result array of objects
                                searchArray.push({
                                    obj: searchObj[i], 
                                    datetime: searchObj[i]['datetime'], 
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
            // searchArray.sort((a, b) => b.matchNum - a.matchNum)

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
                                <p class="gray-small">${ result.obj.datetime } | Mode <span class="red-em">${ result.obj.mode }</span> | Result # <span class="blue-em">${ result.obj.resultCount }</span></p>
                                <p><strong>${ result.obj.searchTerm}</strong></p>
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
                            <p class="gray-small">${ result.obj.datetime } | Mode <span class="red-em">${ result.obj.mode }</span> | Result # <span class="blue-em">${ result.obj.resultCount }</span></p>
                            <p><strong>${ result.obj.searchTerm}</strong></p>
                        `
                    })
                }
                
            }
            
            // // Optionally clear search box
            // searchInput.value = ''

            // // Refocus the search box
            // searchInput.focus()
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
                if (key == 'searchTerm') {
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
                    if (key == 'searchTerm') {
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
        // searchArray.sort((a, b) => b.matchNum - a.matchNum)

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
                            <p class="gray-small">${ result.obj.datetime } | Mode <span class="red-em">${ result.obj.mode }</span> | Result # <span class="blue-em">${ result.obj.resultCount }</span></p>
                            <p><strong>${ result.obj.searchTerm}</strong></p>
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
                        <p class="gray-small">${ result.obj.datetime } | Mode <span class="red-em">${ result.obj.mode }</span> | Result # <span class="blue-em">${ result.obj.resultCount }</span></p>
                        <p><strong>${ result.obj.searchTerm}</strong></p>
                    `
                })
            }
        }

        // // Optionally clear search box
        // searchInput.value = ''

        // // Refocus the search box
        // searchInput.focus()
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
                <p class="gray-small">${ result.obj.datetime } | Mode <span class="red-em">${ result.obj.mode }</span> | Result # <span class="blue-em">${ result.obj.resultCount }</span></p>
                <p><strong>${ result.obj.searchTerm}</strong></p>
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
        resultCount: [], 
        mode: []
    }

    resultCount0.checked = false
    resultCount1.checked = false
    mode1.checked = false
    mode2.checked = false
    mode3.checked = false

    // Call filterSearch with empty search input
    filterSearch()
}

//
// SEARCH FILTER PART
//

const resultCount0 = document.getElementById('resultCount0')
const resultCount1 = document.getElementById('resultCount1')
const mode1 = document.getElementById('mode1')
const mode2 = document.getElementById('mode2')
const mode3 = document.getElementById('mode3')

let filterObj = {  // Init an object to hold filter values
    resultCount: [], 
    mode: []
}

// Add click listener
resultCount0.addEventListener('click', e => {
    const filterKey = 'resultCount'

    filterPrep(filterKey, resultCount0.value)
})

resultCount1.addEventListener('click', e => {
    const filterKey = 'resultCount'

    filterPrep(filterKey, resultCount0.value)
})

mode1.addEventListener('click', e => {
    const filterKey = 'mode'

    filterPrep(filterKey, mode1.value) 
})

mode2.addEventListener('click', e => {
    const filterKey = 'mode'

    filterPrep(filterKey, mode2.value)
})

mode3.addEventListener('click', e => {
    const filterKey = 'mode'

    filterPrep(filterKey, mode3.value)
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
    let resultCountCheck = false
    let modeCheck = false

    for (const [key, value] of Object.entries(filterObj)) {
        if (key === 'resultCount') {
            if (value.length !== 0) {
                resultCountCheck = true
            }
        }

        if (key === 'mode') {
            if (value.length !== 0) {
                modeCheck = true
            }
        }
    }

    // CASE 0: None is checked
    if (resultCountCheck === false && modeCheck === false) {

    } else {  // CASE 1: Some are checked
        // Stage 1: filter resultCount first
        let searchObjFilteredResultCount = []

        if (resultCountCheck === false) {
            // If no resultCount is checked, it means ALL is checked, 
            // so assign searchObj to search object of this stage
            searchObjFilteredResultCount = searchObj
        } else {
            for (const [filterKey, filterValue] of Object.entries(filterObj)) {
                filterValue.forEach(fValue => {
                    searchObj.forEach((obj, i) => {
                        for (const [key, value] of Object.entries(obj)) {
                            if (key === 'resultCount') {
                                if (Number(fValue) === 0) {  // For resultCount = 0
                                    if (value === 0) {
                                        searchObjFilteredResultCount.push(searchObj[i])
                                    }
                                }
        
                                if (Number(fValue) === 1) {  // For resultCount > 0
                                    if (value !== 0) {
                                        searchObjFilteredResultCount.push(searchObj[i])
                                    }
                                }
                            }
                        }
                    })
                })
            }
        }

        searchObjFiltered = searchObjFilteredResultCount

        searchObjFiltered.sort(function(a,b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.datetime) - new Date(a.datetime);
        })
        // // Stage 2: filter MODE from filtered resultCount
        // if (modeCheck === false) {
        //     // If no mode is checked, it means ALL is checked, 
        //     // so assign searchObj to search object of this stage
        //     searchObjFiltered = searchObjFilteredResultCount
        // } else {
        //     for (const [filterKey, filterValue] of Object.entries(filterObj)) {
        //         filterValue.forEach(fValue => {
        //             searchObjFilteredResultCount.forEach((obj, i) => {
        //                 for (const [key, value] of Object.entries(obj)) {
        //                     if (key === 'mode') {
        //                         if (Number(fValue) === 1) {
        //                             if (value == 1) {
        //                                 searchObjFiltered.push(searchObjFilteredResultCount[i])
        //                             }
        //                         }

        //                         if (Number(fValue) === 2) {
        //                             if (value == 2) {
        //                                 searchObjFiltered.push(searchObjFilteredResultCount[i])
        //                             }
        //                         }

        //                         if (Number(fValue) === 3) {
        //                             if (value == 3) {
        //                                 searchObjFiltered.push(searchObjFilteredResultCount[i])
        //                             }
        //                         }
        //                     }
        //                 }
        //             })
        //         })
        //     }
        // }
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
    resultCount0.checked = false
    resultCount1.checked = false
    mode1.checked = false
    mode2.checked = false
    mode3.checked = false

    // Disable main-wrapper and search UI until JSON is loaded
    searchBox.disabled = true
    document.getElementById('mainWrapper').style.opacity = '0.5'
}