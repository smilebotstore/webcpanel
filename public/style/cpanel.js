document.getElementById('createServerBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const ramOption = document.getElementById('ramOption').value;
    const key = document.getElementById('key').value;

    if (!username || !email || !ramOption || !key) {
        alert('Please fill all fields.');
        return;
    }

    const loadingSpinner = document.getElementById('loadingSpinner');
    const statusMessage = document.getElementById('statusMessage');
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch('/create-panel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, ramOption, email, key })
        });

        const data = await response.json();

        if (data.message.includes('berhasil')) {
            statusMessage.textContent = '✅ Server berhasil dibuat! Silahkan Cek Email Anda';
            statusMessage.style.color = '#28a745';
        } else {
            statusMessage.textContent = `❌ ${data.message}`;
            statusMessage.style.color = '#dc3545';
        }
    } catch (error) {
        console.error(error);
        statusMessage.textContent = '❌ An error occurred. Please try again.';
        statusMessage.style.color = '#dc3545';
    } finally {
        loadingSpinner.style.display = 'none';
        statusMessage.style.display = 'block';
    }
});

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