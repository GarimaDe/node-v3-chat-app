const socket = io()

//Elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')



//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
const {username, room}= Qs.parse(location.search, {ignoreQueryPrefix : true})

// //Receiving event
// socket.on('countUpdated', (count)=>{
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log('Clicked')
//     socket.emit('incrementEvent')
// })

const autoscroll = ()=>{
    // New message that is added

    const  $newMessage = $messages.lastElementChild

    //Height of the new element
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin //This doesn't include margin bottom spacing value
    console.log(newMessageMargin)

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of msgs container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate,{
        username : msg.username,
        message : msg.text ,//The second message is from above First one is the name used in index.html
        createdAt : moment(msg.createdAt).format('h:mm:a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate , {
        username : message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm:a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    //Disable the form

    $messageFormButton.setAttribute('disabled', 'Disabled')

    const msg = e.target.elements.message.value
    socket.emit('sendMessage', msg, (error)=>{

        $messageFormButton.removeAttribute('Disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error)
        {
            return console.log(error)
        }
        console.log('message delivered')
    })
})


$locationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation)
    {
        return alert('GeoLocation is not supported by your browser')
    }
    //Disable button 
    $locationButton.setAttribute('disabled', 'Disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
       
        socket.emit('sendLocation', {
            latitude : position.coords.latitude, 
            longitude: position.coords.longitude
        }, ()=>{
            $locationButton.removeAttribute('Disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join', {username, room} , (error)=>{
    if(error)
    {
        alert(error)
        location.href = "/"
    }
})