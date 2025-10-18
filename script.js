document.getElementById('interest-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const modal = parseFloat(document.getElementById('modal_usd').value);
    const tanggalMulai = new Date(document.getElementById('tanggal_mulai').value);
    const tanggalAkhir = new Date(document.getElementById('tanggal_akhir').value);
    const bungaHarian = parseFloat(document.getElementById('bunga_harian').value);

    if (tanggalMulai > tanggalAkhir) {
        alert("Tanggal mulai harus sebelum tanggal akhir.");
        return;
    }

    let totalHariAktif = 0;
    let totalHariMinggu = 0;
    let saldo = modal;
    let tgl = new Date(tanggalMulai);

    while (tgl <= tanggalAkhir) {
        if (tgl.getDay() === 0) {
            totalHariMinggu++; // Hari Minggu
        } else {
            saldo *= (1 + bungaHarian / 100);
            totalHariAktif++;
        }
        tgl.setDate(tgl.getDate() + 1);
    }

    const totalBungaUSD = saldo - modal;

    // Ambil kurs dari exchangerate.host
    let kurs = 16000; // fallback
    try {
        const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=IDR');
        const data = await res.json();
        if (data && data.rates && data.rates.IDR) {
            kurs = data.rates.IDR;
        }
    } catch (err) {
        console.warn("Gagal ambil kurs otomatis, gunakan default.");
    }

    const totalAkhirIDR = saldo * kurs;
    const totalBungaIDR = totalBungaUSD * kurs;

    const hasilEl = document.getElementById('hasil');
    hasilEl.innerHTML = `
        <h3>Hasil Perhitungan</h3>
        <p><strong>Total hari aktif (Senin–Sabtu):</strong> ${totalHariAktif} hari</p>
        <p><strong>Total hari Minggu dilewati:</strong> ${totalHariMinggu} hari</p>
        <hr>
        <p><strong>Total bunga (USD):</strong> $${totalBungaUSD.toFixed(2)}</p>
        <p><strong>Total akhir (USD):</strong> $${saldo.toFixed(2)}</p>
        <p><strong>Kurs USD ke IDR:</strong> Rp${kurs.toFixed(2)}</p>
        <p><strong>Total bunga (IDR):</strong> Rp${totalBungaIDR.toFixed(2)}</p>
        <p><strong>Total akhir (IDR):</strong> Rp${totalAkhirIDR.toFixed(2)}</p>
    `;
    hasilEl.classList.remove('hidden');

});
