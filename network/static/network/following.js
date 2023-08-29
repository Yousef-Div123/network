import {get_posts} from './functions.js'


function page_is_empty(){
    let body = document.querySelector('#body-following').innerHTML

    if(body === ''){
        document.querySelector('#body-following').innerHTML += '<h3 class = "text-warning m-2">You are not following any one right now....</h3>'
    }
}

document.addEventListener('DOMContentLoaded', function(){
    get_posts('http://127.0.0.1:8000/api/following/1', '#body-following', page_is_empty)
    
})