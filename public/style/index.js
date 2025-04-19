function openLink(url) {
    window.location.href = url;
}

particlesJS("particles-js", {
    particles: {
        number: { value: 90, density: { enable: true, value_area: 800 } },
        shape: { 
            type: "polygon", 
            stroke: { width: 2, color: "#00e4ff" }, 
            polygon: { nb_sides: 6 } 
        },
        opacity: { value: 0.6, random: true },
        size: { value: 12, random: true },
        move: { enable: true, speed: 2, direction: "top", out_mode: "out" },
        line_linked: { enable: true, distance: 140, color: "#00e4ff", opacity: 0.5, width: 2 }
    },
    interactivity: {  
        detect_on: "canvas",  
        events: {  
            onhover: { enable: false },
            onclick: { enable: false },
            resize: true  
        }  
    }
});