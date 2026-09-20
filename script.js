/* =========================================================
   HEADER
========================================================= */

const header =
document.getElementById("header");

const backTop =
document.getElementById("backTop");

window.addEventListener("scroll",()=>{

    if(window.scrollY > 50){

        header.classList.add("scrolled");

        backTop.classList.add("show");

    }else{

        header.classList.remove("scrolled");

        backTop.classList.remove("show");

    }

});


backTop.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});


/* =========================================================
   MOBILE MENU
========================================================= */

const menuToggle =
document.getElementById("menuToggle");

const navMenu =
document.getElementById("navMenu");


menuToggle.addEventListener("click",()=>{

    navMenu.classList.toggle("active");

    const icon =
    menuToggle.querySelector("i");

    icon.className =
    navMenu.classList.contains("active")
    ? "fa-solid fa-xmark"
    : "fa-solid fa-bars";

});


/* =========================================================
   MOBILE DROPDOWN
========================================================= */

document
.querySelectorAll(".nav-item")
.forEach(item=>{

    const link =
    item.querySelector(":scope > .nav-link");

    const dropdown =
    item.querySelector(".dropdown");

    if(!dropdown) return;

    link.addEventListener("click",(event)=>{

        if(window.innerWidth <= 800){

            event.preventDefault();

            item.classList.toggle("open");

        }

    });

});


/* =========================================================
   SLIDER
========================================================= */

const sliderStates =
new WeakMap();


function getSliderState(container){

    if(!sliderStates.has(container)){

        sliderStates.set(
            container,
            {
                index:0,
                dragging:false,
                startX:0,
                currentX:0,
                moved:false,
                wheelLock:false
            }
        );

    }

    return sliderStates.get(container);

}


function getVisibleCount(container){

    const width =
    container.clientWidth;

    if(width <= 560)
        return 1;

    if(width <= 800)
        return 2;

    if(width <= 1100)
        return 3;

    return 4;

}


function updateSlider(container){

    const track =
    container.querySelector(
        ".products-track"
    );

    const cards =
    [
        ...track.querySelectorAll(
            ".product-box"
        )
    ];

    if(!cards.length)
        return;

    const state =
    getSliderState(container);

    const visible =
    getVisibleCount(container);

    const maxIndex =
    Math.max(
        0,
        cards.length - visible
    );

    if(state.index > maxIndex)
        state.index = 0;

    if(state.index < 0)
        state.index = maxIndex;

    const gap =
    parseFloat(
        getComputedStyle(track).gap
    ) || 0;

    const cardWidth =
    cards[0]
    .getBoundingClientRect()
    .width;

    const move =
    (cardWidth + gap) *
    state.index;

    track.style.transform =
    `translate3d(-${move}px,0,0)`;

}


function slideProducts(button,direction){

    const container =
    button.closest(
        ".products-slider-container"
    );

    if(!container)
        return;

    const track =
    container.querySelector(
        ".products-track"
    );

    const cards =
    [
        ...track.querySelectorAll(
            ".product-box"
        )
    ];

    if(!cards.length)
        return;

    const state =
    getSliderState(container);

    const visible =
    getVisibleCount(container);

    const maxIndex =
    Math.max(
        0,
        cards.length - visible
    );

    state.index += direction;

    if(state.index > maxIndex)
        state.index = 0;

    if(state.index < 0)
        state.index = maxIndex;

    updateSlider(container);

}


/* =========================================================
   INITIALIZE SLIDERS
========================================================= */

document
.querySelectorAll(
    ".products-slider-container"
)
.forEach(container=>{

    updateSlider(container);

    const state =
    getSliderState(container);


    /* POINTER DOWN */

    container.addEventListener(
        "pointerdown",
        event=>{

            if(
                event.target.closest("a") ||
                event.target.closest("button")
            ){
                return;
            }

            state.dragging = true;

            state.moved = false;

            state.startX =
            event.clientX;

            state.currentX =
            event.clientX;

            container.classList.add(
                "dragging"
            );

            try{

                container.setPointerCapture(
                    event.pointerId
                );

            }catch(e){}

        }
    );


    /* POINTER MOVE */

    container.addEventListener(
        "pointermove",
        event=>{

            if(!state.dragging)
                return;

            state.currentX =
            event.clientX;

            if(
                Math.abs(
                    state.currentX -
                    state.startX
                ) > 8
            ){

                state.moved = true;

            }

        }
    );


    /* POINTER UP */

    container.addEventListener(
        "pointerup",
        ()=>{

            if(!state.dragging)
                return;

            state.dragging = false;

            container.classList.remove(
                "dragging"
            );

            const diff =
            state.currentX -
            state.startX;

            if(Math.abs(diff) > 55){

                slideProducts(

                    container.querySelector(
                        ".side-next"
                    ),

                    diff < 0 ? 1 : -1

                );

            }

        }
    );


    /* POINTER CANCEL */

    container.addEventListener(
        "pointercancel",
        ()=>{

            state.dragging = false;

            container.classList.remove(
                "dragging"
            );

        }
    );


    /* WHEEL */

    container.addEventListener(
        "wheel",
        event=>{

            if(
                Math.abs(event.deltaX) <
                Math.abs(event.deltaY)
            ){
                return;
            }

            if(state.wheelLock)
                return;

            state.wheelLock = true;

            slideProducts(

                container.querySelector(
                    ".side-next"
                ),

                event.deltaX > 0 ? 1 : -1

            );

            setTimeout(()=>{

                state.wheelLock = false;

            },450);

        },
        {passive:true}
    );


    /* CARD 360 */

    container
    .querySelectorAll(".product-box")
    .forEach(card=>{

        card.addEventListener(
            "click",
            event=>{

                if(state.moved)
                    return;

                if(
                    event.target.closest("a") ||
                    event.target.closest("button")
                ){
                    return;
                }

                card.classList.remove(
                    "spin-360"
                );

                void card.offsetWidth;

                card.classList.add(
                    "spin-360"
                );

                card.addEventListener(
                    "animationend",
                    ()=>{
                        card.classList.remove(
                            "spin-360"
                        );
                    },
                    {once:true}
                );

            }
        );


        /* 3D MOUSE TILT */

        card.addEventListener(
            "mousemove",
            event=>{

                if(
                    window.innerWidth <= 800
                )
                    return;

                const rect =
                card.getBoundingClientRect();

                const x =
                event.clientX -
                rect.left;

                const y =
                event.clientY -
                rect.top;

                const rotateY =
                ((x / rect.width) - .5) * 8;

                const rotateX =
                ((y / rect.height) - .5) * -8;

                card.style.transform =
                `
                translateY(-10px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.01)
                `;

            }
        );


        card.addEventListener(
            "mouseleave",
            ()=>{

                card.style.transform = "";

            }
        );

    });

});


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    ()=>{

        document
        .querySelectorAll(
            ".products-slider-container"
        )
        .forEach(updateSlider);

    }
);


/* =========================================================
   FAQ
========================================================= */

document
.querySelectorAll(".faq-question")
.forEach(question=>{

    question.addEventListener(
        "click",
        ()=>{

            const item =
            question.parentElement;

            const answer =
            item.querySelector(
                ".faq-answer"
            );


            document
            .querySelectorAll(".faq-item")
            .forEach(other=>{

                if(other !== item){

                    other.classList.remove(
                        "active"
                    );

                    other
                    .querySelector(
                        ".faq-answer"
                    )
                    .style.maxHeight =
                    null;

                }

            });


            item.classList.toggle(
                "active"
            );


            if(
                item.classList.contains(
                    "active"
                )
            ){

                answer.style.maxHeight =
                answer.scrollHeight +
                "px";

            }else{

                answer.style.maxHeight =
                null;

            }

        }
    );

});


/* =========================================================
   CONTACT
========================================================= */

function sendMessage(event){

    event.preventDefault();

    alert(
        "Your message form is ready. Connect this form to your email or backend."
    );

    event.target.reset();

}


/* =========================================================
   CURSOR
========================================================= */

const cursor =
document.querySelector(".cursor");

const cursorRing =
document.querySelector(".cursor-ring");


document.addEventListener(
    "mousemove",
    event=>{

        cursor.style.left =
        event.clientX + "px";

        cursor.style.top =
        event.clientY + "px";

        cursorRing.style.left =
        event.clientX + "px";

        cursorRing.style.top =
        event.clientY + "px";

    }
);


/* =========================================================
   PARTICLES
========================================================= */

const canvas =
document.getElementById("particles");

const ctx =
canvas.getContext("2d");

let particles = [];


function resizeCanvas(){

    const ratio =
    window.devicePixelRatio || 1;

    canvas.width =
    window.innerWidth * ratio;

    canvas.height =
    window.innerHeight * ratio;

    canvas.style.width =
    window.innerWidth + "px";

    canvas.style.height =
    window.innerHeight + "px";

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

}


function createParticles(){

    particles = [];

    const count =
    Math.min(
        95,
        Math.floor(
            window.innerWidth / 14
        )
    );


    for(
        let i=0;
        i<count;
        i++
    ){

        particles.push({

            x:
            Math.random() *
            window.innerWidth,

            y:
            Math.random() *
            window.innerHeight,

            r:
            Math.random() *
            1.6 + .3,

            vx:
            (Math.random()-.5)
            *.22,

            vy:
            (Math.random()-.5)
            *.22,

            alpha:
            Math.random() *
            .45 + .15

        });

    }

}


resizeCanvas();

createParticles();


function animateParticles(){

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    for(
        let i=0;
        i<particles.length;
        i++
    ){

        const p =
        particles[i];

        p.x += p.vx;
        p.y += p.vy;


        if(p.x < 0)
            p.x =
            window.innerWidth;

        if(
            p.x >
            window.innerWidth
        )
            p.x = 0;


        if(p.y < 0)
            p.y =
            window.innerHeight;

        if(
            p.y >
            window.innerHeight
        )
            p.y = 0;


        /* GLOW */

        const glow =
        ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            8
        );

        glow.addColorStop(
            0,
            `rgba(0,220,255,${p.alpha})`
        );

        glow.addColorStop(
            1,
            "rgba(0,220,255,0)"
        );

        ctx.fillStyle = glow;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* CORE */

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.r,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
        `rgba(170,220,255,${p.alpha})`;

        ctx.fill();


        /* CONNECTIONS */

        for(
            let j=i+1;
            j<particles.length;
            j++
        ){

            const q =
            particles[j];

            const dx =
            p.x - q.x;

            const dy =
            p.y - q.y;

            const distance =
            Math.sqrt(
                dx*dx +
                dy*dy
            );


            if(distance < 125){

                ctx.beginPath();

                ctx.moveTo(
                    p.x,
                    p.y
                );

                ctx.lineTo(
                    q.x,
                    q.y
                );

                ctx.strokeStyle =
                `
                rgba(
                    100,
                    190,
                    255,
                    ${(1-distance/125)*.08}
                )
                `;

                ctx.lineWidth =
                .6;

                ctx.stroke();

            }

        }

    }


    requestAnimationFrame(
        animateParticles
    );

}


animateParticles();


window.addEventListener(
    "resize",
    ()=>{

        resizeCanvas();

        createParticles();

    }
);

