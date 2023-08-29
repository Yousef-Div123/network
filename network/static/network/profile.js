import {get_posts} from './functions.js'
import {follow} from './functions.js'


document.addEventListener('DOMContentLoaded', function() 
{   
    let content = document.querySelector('.username').id
    let username = content.slice(content.indexOf('-')+1)

    get_posts(`http://127.0.0.1:8000/api/posts/${username}/1`, '#body-profile', function empty(){}) 

    try{
        document.querySelector('#follow_button').addEventListener('click', function(e){
            follow(username)
        })  
    }
    catch{
        console.log('')
    }

});

