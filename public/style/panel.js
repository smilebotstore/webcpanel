document.getElementById('createServerBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const ramOption = document.getElementById('ramOption').value;

    if (!username || !email || !ramOption) {
        alert('Please fill all fields.');
        return;
    }

    document.getElementById('loadingSpinner').style.display = 'block';

    await new Promise(resolve => setTimeout(resolve, 1000));

    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('qrCodeSection').style.display = 'block';

    let basePrice = 0;
    switch (ramOption) {
        case 'panel1gb': basePrice = 1000; break;
        case 'panel2gb': basePrice = 2000; break;
        case 'panel3gb': basePrice = 3000; break;
        case 'panel4gb': basePrice = 4000; break;
        case 'panel5gb': basePrice = 5000; break;
        case 'panel6gb': basePrice = 6000; break;
        case 'panel7gb': basePrice = 7000; break;
        case 'panel8gb': basePrice = 8000; break;
        case 'panel9gb': basePrice = 9000; break;
        case 'panel10gb': basePrice = 10000; break;
        case 'panel11gb': basePrice = 11000; break;
        case 'panel12gb': basePrice = 12000; break;
        case 'panel13gb': basePrice = 13000; break;
        case 'panel14gb': basePrice = 14000; break;
        case 'panel15gb': basePrice = 15000; break;
        case 'panel16gb': basePrice = 16000; break;
        case 'panel17gb': basePrice = 17000; break;
        case 'panel18gb': basePrice = 18000; break;
        case 'panel19gb': basePrice = 19000; break;
        case 'panel20gb': basePrice = 20000; break;
        case 'unlimited': basePrice = 0; break;
    }

    const adminFee = Math.floor(Math.random() * 11) + 10;
    const totalAmount = basePrice + adminFee;

    try {
        const createPayResponse = await fetch('/createpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalAmount })
        });
        const createPayData = await createPayResponse.json();

        if (createPayData.status) {
            document.getElementById('qrCodeImage').src = createPayData.qrImageUrl;

            const transactionId = createPayData.transactionId;
            const checkStatusInterval = setInterval(async () => {
                const statusResponse = await fetch('/cekstatus');
                const statusData = await statusResponse.json();

                if (statusData.latestTransaction && statusData.latestTransaction.amount == totalAmount) {
                    clearInterval(checkStatusInterval);

                    const createServerResponse = await fetch('/create-server', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, ramOption, email })
                    });
                    const createServerData = await createServerResponse.json();

                    if (createServerData.message.includes('berhasil')) {
                        document.getElementById('statusMessage').textContent = `Server created successfully! Check your email (${email}) for details.`;
                    } else {
                        document.getElementById('statusMessage').textContent = 'Failed to create server. Please try again.';
                    }

                    document.getElementById('qrCodeSection').style.display = 'none';
                    document.getElementById('statusMessage').style.display = 'block';

                    setTimeout(() => {
                        document.getElementById('statusMessage').style.display = 'none';
                        document.getElementById('formContainer').style.display = 'block';
                        document.getElementById('username').value = '';
                        document.getElementById('email').value = '';
                        document.getElementById('ramOption').value = 'panel1gb';
                    }, 5000);
                }
            }, 5000);
        } else {
            alert('Failed to generate payment QR Code.');
            document.getElementById('formContainer').style.display = 'block';
            document.getElementById('qrCodeSection').style.display = 'none';
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again.');
        document.getElementById('formContainer').style.display = 'block';
        document.getElementById('qrCodeSection').style.display = 'none';
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none';
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