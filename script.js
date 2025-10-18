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

    // 🔁 Ambil kurs terbaru dari exchangerate.host
    let kurs = 16000; // fallback
    let kursUpdate = "Default (Rp16.000,00)"; // info default
    let apiSukses = false;

    try {
        const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=IDR');
        const data = await res.json();
        if (data && data.rates && data.rates.IDR) {
            kurs = data.rates.IDR;
            apiSukses = true;
            const waktuUpdate = new Date(data.date + "T00:00:00Z");
            kursUpdate = waktuUpdate.toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta",
            });
        }
    } catch (err) {
        console.warn("⚠️ Gagal ambil kurs otomatis, gunakan default Rp16.000");
    }

    const totalAkhirIDR = saldo * kurs;
    const totalBungaIDR = totalBungaUSD * kurs;

    // 💰 Format angka
    function formatRupiah(angka) {
        return angka.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
        });
    }

    function formatUSD(angka) {
        return angka.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        });
    }

    // 🧾 Hasil ditampilkan
    const hasilEl = document.getElementById('hasil');
    hasilEl.innerHTML = `
        <h3>Hasil Perhitungan</h3>
        <p><strong>Total hari aktif (Senin–Sabtu):</strong> ${totalHariAktif} hari</p>
        <p><strong>Total hari Minggu dilewati:</strong> ${totalHariMinggu} hari</p>
        <hr>
        <p><strong>Total bunga (USD):</strong> ${formatUSD(totalBungaUSD)}</p>
        <p><strong>Total akhir (USD):</strong> ${formatUSD(saldo)}</p>
        <p><strong>Kurs USD ke IDR:</strong> ${formatRupiah(kurs)}</p>
        <p><strong>Total bunga (IDR):</strong> ${formatRupiah(totalBungaIDR)}</p>
        <p><strong>Total akhir (IDR):</strong> ${formatRupiah(totalAkhirIDR)}</p>
        <hr>
        <p style="font-size: 13px; color: ${apiSukses ? '#7fff7f' : '#ff8080'};">
            ${apiSukses 
                ? `✅ Kurs diperbarui: ${kursUpdate} (sumber: exchangerate.host)`
                : `⚠️ Gagal ambil kurs otomatis, gunakan nilai default Rp16.000,00`
            }
        </p>
    `;
    hasilEl.classList.remove('hidden');
});
