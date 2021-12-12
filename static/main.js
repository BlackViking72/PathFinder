
let rows = null
let cols = null
let mapArray = []

nodeClickHandler = (event) => {
    const currentOption = getCurrentOption()
    const buttonEl = event.target
    if (!currentOption) {
        return
    }

    // Remove other destination if present
    if (currentOption === 'destination') {
        const currentDestinationEl = document.querySelector(".node[data-node='destination']")
        if (currentDestinationEl && currentDestinationEl != buttonEl) {
            currentDestinationEl.setAttribute("data-node", 'node')
        }
    }

    // Remove other start if present
    if (currentOption === 'start') {
        const currentDestinationEl = document.querySelector(".node[data-node='start']")
        if (currentDestinationEl && currentDestinationEl != buttonEl) {
            currentDestinationEl.setAttribute("data-node", 'node')
        }
    }

    buttonEl.setAttribute("data-node", buttonEl.getAttribute('data-node') === currentOption ? 'node' : currentOption)
    const selectorOption = document.querySelector("#options")
    // Update Map Array
    const rowIndex = buttonEl.getAttribute('data-position-row')
    const colIndex = buttonEl.getAttribute('data-position-col')
    switch(buttonEl.getAttribute('data-node')) {
        case 'destination': 
            selectorOption.value = 'obstacle'
            setCurrentOption()
            mapArray[rowIndex][colIndex] = 9
            break
        case 'obstacle': mapArray[rowIndex][colIndex] = 0
            break
        case 'start': 
            selectorOption.value = 'destination'
            setCurrentOption()
            mapArray[rowIndex][colIndex] = 1
            break
        case 'node': mapArray[rowIndex][colIndex] = 1
            break
    }
}

populate_map = async (rows, cols, mapEl, box_size) => {
    mapArray = []
    for (i=0; i<rows; i++) {
        const newRow = []
        for (j=0; j<cols; j++) {
            newRow.push(1)
            const box = document.createElement('button')
            box.setAttribute("data-position-row", i)
            box.setAttribute("data-position-col", j)
            box.setAttribute("data-node", 'node')
            box.addEventListener('click', nodeClickHandler)
            box.classList.add('node')
            box.style.height = `${box_size}px`
            box.style.width = `${box_size}px`
            mapEl.appendChild(box)
        }
        mapArray.push(newRow)
    }
}

getCurrentOption = () => {
    const selectorOptions = document.querySelector("#options")
    if (!selectorOptions) {
        return null
    }
    return selectorOptions.value
}

setCurrentOption = () => {
    const selectorOptions = document.querySelector("#options")
    const mapEl = document.querySelector("#map")
    if (!selectorOptions || !mapEl) {
        return
    }
    mapEl.classList.remove("destination-option")
    mapEl.classList.remove("obstacle-option")
    mapEl.classList.remove("start-option")

    switch(selectorOptions.value) {
        case 'destination': 
            mapEl.classList.add("destination-option")
            break
        case 'obstacle':
            mapEl.classList.add("obstacle-option")
            break
        case 'start':
            mapEl.classList.add("start-option")
            break
    }
}

initializeMap = () => {
    const BOX_SIZE = 20 // in pixels
    const mapEl = document.querySelector("#map")
    mapEl.innerHTML = null
    if (!mapEl)
        return
    
    const mapElWidth = mapEl.offsetWidth
    const mapElHeight = mapEl.offsetHeight

    const r = Math.floor(mapElHeight / BOX_SIZE)
    const c = Math.floor(mapElWidth / BOX_SIZE)
    rows = r
    cols = c
    mapEl.style.gridTemplateColumns = `repeat(${c}, ${BOX_SIZE}px)`
    mapEl.style.gridTemplateRows = `repeat(${r}, ${BOX_SIZE}px)`
    populate_map(r, c, mapEl, BOX_SIZE)

    setCurrentOption()
}

findPath = () => {
    const startNodeEl = document.querySelector(".node[data-node='start']")
    const destinationNodeEl = document.querySelector(".node[data-node='destination']")
    if (!startNodeEl || !destinationNodeEl) {
        alert(!startNodeEl ? 'Please select starting node' : 'Please select destination node')
        return
    }

    const startNodeRow = startNodeEl.getAttribute('data-position-row')
    const startNodeCol = startNodeEl.getAttribute('data-position-col')

    socket.emit('find_path', {map: mapArray, start: [Number(startNodeRow), Number(startNodeCol)]})
}

resetMap = () => {
    initializeMap()
}

initializeMap()


// Socket Stuff
var socket = io();

socket.on('visited_node', (node) => {
    const boxEl = document.querySelector(`.node[data-position-row='${node[0]}'][data-position-col='${node[1]}']`)
    if (!boxEl)
        return
    
    boxEl.classList.toggle('visited')
})
socket.on('final_result', (res) => {
    if (!res.pathFound) {
        alert("No path found!")
        return
    }
    res.path.forEach(node => {
        const boxEl = document.querySelector(`.node[data-position-row='${node[0]}'][data-position-col='${node[1]}']`)
        if (!boxEl)
            return
        boxEl.classList.remove('visited')
        boxEl.classList.toggle('path')
    })
})