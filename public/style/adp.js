document.getElementById('createAdminBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;

    if (!username || !email) {
        alert('Please fill all fields.');
        return;
    }

    setTimeout(async () => {
        try {
            const adminFee = Math.floor(Math.random() * 11) + 10;
            const basePrice = 10000;
            const totalAmount = basePrice + adminFee;

            const createPayResponse = await fetch('/createpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalAmount })
            });
            const createPayData = await createPayResponse.json();

            if (createPayData.status) {
                document.getElementById('qrCodeImage').src = createPayData.qrImageUrl;
                document.getElementById('formSection').classList.add('hidden');
                document.getElementById('qrCodeSection').classList.remove('hidden');

                const checkStatusInterval = setInterval(async () => {
                    const statusResponse = await fetch('/cekstatus');
                    const statusData = await statusResponse.json();

                    if (statusData.latestTransaction && statusData.latestTransaction.amount == totalAmount) {
                        clearInterval(checkStatusInterval);

                        const createAdminResponse = await fetch('/create-admin', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, email })
                        });
                        const createAdminData = await createAdminResponse.json();

                        if (createAdminData.message.includes('berhasil')) {
                            document.getElementById('statusMessage').textContent =
                                'Admin created successfully! Check your email for details.';
                        } else {
                            document.getElementById('statusMessage').textContent =
                                'Failed to create admin. Please try again.';
                        }
                    }
                }, 5000);
            } else {
                alert('Failed to generate payment QR Code.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please try again.');
        }
    }, 1000);
});