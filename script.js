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
            totalHariMinggu++; // Minggu dilewati
        } else {
            saldo *= (1 + bungaHarian / 100);
            totalHariAktif++;
        }
        tgl.setDate(tgl.getDate() + 1);
    }

    const totalBungaUSD = saldo - modal;

    // 🔁 Ambil kurs dari API bebas CORS (stabil untuk GitHub Pages)
    let kurs = 16000; // fallback
    let kursUpdate = "Default (Rp16.000,00)";
    let apiSukses = false;

    try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();

        if (data && data.rates && data.rates.IDR) {
            kurs = data.rates.IDR;
            apiSukses = true;
            const waktuUpdate = new Date(data.time_last_update_utc);
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

    // 🧾 Tampilkan hasil
    const hasilEl = document.getElementById('hasil');
    hasilEl.innerHTML = `
        <h3>Hasil Perhitungan</h3>
        <p>Total hari aktif (Senin–Sabtu): ${totalHariAktif} hari</p>
        <p>Total hari Minggu dilewati: ${totalHariMinggu} hari</p>
        <hr>
        <p>Total bunga (USD): ${formatUSD(totalBungaUSD)}</p>
        <p>Total akhir (USD): ${formatUSD(saldo)}</p>
        <p>Kurs USD ke IDR: ${formatRupiah(kurs)}</p>
        <p>Total bunga (IDR): ${formatRupiah(totalBungaIDR)}</p>
        <p>Total akhir (IDR): ${formatRupiah(totalAkhirIDR)}</p>
        <hr>
        <p style="font-size: 13px; color: ${apiSukses ? '#7fff7f' : '#ff8080'};">
            ${apiSukses 
                ? `✅ Kurs diperbarui: ${kursUpdate} (sumber: open.er-api.com)`
                : `⚠️ Gagal ambil kurs otomatis, gunakan nilai default Rp16.000,00`
            }
        </p>
    `;
    hasilEl.classList.remove('hidden');
});


