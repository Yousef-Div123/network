import {get_posts} from './functions.js'

document.addEventListener('DOMContentLoaded', function() 
{   
    
    get_posts('/api/posts/1', '.body-index', function empty(){})   
});





