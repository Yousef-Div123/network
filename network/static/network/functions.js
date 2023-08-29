function getCookie(c_name) // This function is from stack over flow
{
    if (document.cookie.length > 0)
    {
        let c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1)
        {
            c_start = c_start + c_name.length + 1;
            let c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
 }

function like_click(e){
    //post_id = button.parent.parent.parent.parent.id
    let post_id = e.target.id.slice(e.target.id.indexOf('-')+1)
    fetch(`/api/like/${post_id}`, {
        method: 'POST',
        headers: { "X-CSRFToken": getCookie("csrftoken") }
      })
    .then(response => response.json())
    .then(result => {
        if (document.getElementById(`like-${post_id}`).classList.contains('like-fill')){
            document.getElementById(`like-${post_id}`).classList.remove('like-fill')
            document.getElementById(`like-${post_id}`).classList.add('like-unfill')
            document.getElementById(`likes-${post_id}`).innerHTML = Number(document.getElementById(`likes-${post_id}`).innerHTML) - 1
        }
        else{
            document.getElementById(`like-${post_id}`).classList.remove('like-unfill')
            document.getElementById(`like-${post_id}`).classList.add('like-fill')
            document.getElementById(`likes-${post_id}`).innerHTML = Number(document.getElementById(`likes-${post_id}`).innerHTML) + 1
        }
    })
}

function profile_click(e){
    let username = e.target.innerHTML
    window.location.href = `http://127.0.0.1:8000/profile/${username}`
}

function edit_click(e){
    let id = e.target.id.slice(5).trim()
    let card_body = document.getElementById(`body-${id}`)
    let body = card_body.innerHTML
    let edit_body = document.createElement('textarea')
    edit_body.id = `textarea-${id}`

    edit_body.value = body
    card_body.replaceWith(edit_body)


    e.target.removeEventListener("click", edit_click)
    e.target.innerHTML = 'save'
    e.target.addEventListener('click', save_click)
    
}

function save_click(e){
    let id = e.target.id.slice(5).trim()
    let edit_body = document.getElementById(`textarea-${id}`)

    fetch('http://127.0.0.1:8000/api/edit/', {
        method: 'POST',
        headers: { 
            "X-CSRFToken": getCookie("csrftoken"),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_id : id,
            body: edit_body.value
        })
      })
    .then(response => response.json())
    .then(result =>{
        let id = e.target.id.slice(5).trim()
        let card_body = document.createElement('p')
        card_body.classList.add('card-text')
        card_body.id = `body-${id}`
        card_body.innerHTML = result


        edit_body.replaceWith(card_body)
    })
    .then(()=>{
        e.target.removeEventListener("click", save_click)
        e.target.innerHTML = 'edit'
        e.target.addEventListener('click', edit_click)
    })
}

export function get_posts(url, div_id, callback){
    document.querySelector(div_id).innerHTML = ''
    fetch(url)
    .then(response => response.json())
    .then(posts => {
        let post = {}
        for(post of posts){
            let div = `
            <div class="card mx-2 pd-2">
                <div class="card-body" id = '${post.id}'>
                    <h5 class="card-title user_profile" style="cursor:pointer">${post.user}</h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary position-relative">${post.upload_date}</h6>
                    <p class="card-text" id = "body-${post.id}">${post.body}</p>
                    
                    <div class='container-fluid'>
                        <div class = 'row align-items-center' id='like_container_${post.id}'>
                            <div class='fit'style="cursor:pointer">
                                <span class="material-symbols-outlined like_button" id='like-${post.id}'>
                                thumb_up
                                </span>
                            </div>
                            <div class='fit px-1'>
                                <div id='likes-${post.id}'>${post.likes}</div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>`
            let body_div = document.querySelector(div_id)
            body_div.innerHTML += div
            body_div.dataset.pages = post.Number_of_pages 
            

            if (post.liked_by_current_user === true){
                document.getElementById(`like-${post.id}`).classList.add('like-fill')
            }
            else{
                document.getElementById(`like-${post.id}`).classList.add('like-unfill')
            }

            if(post.posted_by_current_user === true){
                document.getElementById(`like_container_${post.id}`).innerHTML += `<button type="button" id='edit-${post.id}'class="btn edit-btn btn-outline-info mx-4">edit</button>`
            }
        }
        document.querySelectorAll('.like_button').forEach(e => {
            e.addEventListener("click", like_click)
        });
        document.querySelectorAll('.user_profile').forEach(e => {
            e.addEventListener("click", profile_click)
        });
        document.querySelectorAll('.edit-btn').forEach(e => {
            e.addEventListener("click", edit_click)
        });
        
        callback()
        let input = {
            "div_id" : div_id,
            'url': url
        }
        return(input)
    }).then(
        (input) =>{
            add_page_number(input.div_id, input.url)
        }
    )
}

export function follow(user){
    fetch(`/api/follow/${user}`, {
        method: 'POST',
        headers: { "X-CSRFToken": getCookie("csrftoken") }
      })
    .then(response => response.json())
    .then(result => {
        let followers = document.querySelector('#followers').innerHTML
        let followers_num = Number(followers.slice(followers.indexOf(':') +1))

        if(result === 'Followed'){
            document.querySelector('#follow_button').innerHTML = 'person_off'

            document.querySelector('#followers').innerHTML = `Followers:${followers_num + 1}`
        }
        else{
            document.querySelector('#follow_button').innerHTML = 'person_add'
            document.querySelector('#followers').innerHTML = `Followers:${followers_num - 1}`
        }
    })
}

function add_page_number(div_id, url){
    let body_div = document.querySelector(div_id)
    let current_page = url.slice(url.lastIndexOf('/')+1)
    let p_div = document.querySelector('.pagination')

    
    
    if(p_div.innerHTML == ''){
        for( let i = 0; i<body_div.dataset.pages; i++){
            let button = ''
            if(i + 1 == current_page){
                button = `<li class="page-item page_number page-number-${i + 1} active"><a class="page-link">${i + 1}</a></li>`
            }
            else{
                button = `<li class="page-item page_number page-number-${i + 1}"><a class="page-link">${i + 1}</a></li>`
            }
            p_div.innerHTML += button
        }

        
        document.querySelectorAll('.page_number').forEach(e => {
            e.addEventListener("click", e => {
                url = url.slice(0, url.lastIndexOf('/')+1)

                let page = e.target.innerHTML
                url = `${url}${page}`
                for( let i = 0; i<body_div.dataset.pages; i++){
                    let num = document.querySelector(`.page-number-${i + 1}`)
                    num.classList.remove('active')
                }
                let parent = e.target.parentElement
                parent.classList.add('active')
                

                get_posts(url,div_id, function empty(){})
                
            })
        });
    }

    
}


