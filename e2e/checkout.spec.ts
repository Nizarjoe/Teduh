import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

test("webhook menolak tanda tangan palsu", async ({ request }) => {
  const response = await request.post("/api/webhooks/midtrans", {
    data: {
      order_id: "TDH000000XXXX",
      status_code: "200",
      gross_amount: "10000.00",
      signature_key: "nope",
      transaction_status: "settlement",
    },
  });
  expect(response.status()).toBe(401);
});

test("tamu bisa checkout sampai status lunas", async ({ page }) => {
  await page.goto("/katalog");
  await page.getByRole("link", { name: /Setelan Deras/ }).first().click();
  await page.getByRole("group", { name: "Ukuran" }).getByText("L", { exact: true }).click();
  await page.getByRole("radio", { name: "Hitam", exact: true }).check();
  await page.getByRole("button", { name: "Masukkan keranjang" }).first().click();
  await page.getByRole("link", { name: /Keranjang/ }).click();
  await page.getByRole("link", { name: "Lanjut ke pembayaran" }).click();

  const phone = `0813${String(Date.now()).slice(-8)}`;
  await page.getByLabel("Nama").fill("Sari Dewi");
  await page.getByLabel("WhatsApp").fill(phone);
  await page.getByLabel("Provinsi").selectOption({ label: "DKI Jakarta" });
  await page.getByLabel("Kota atau kabupaten").selectOption({ label: "Jakarta Selatan" });
  await page.getByLabel("Kecamatan").selectOption({ label: "Cilandak" });
  await page.getByLabel("Alamat").fill("Jl. Melati No. 8, RT 02");
  await expect(page.getByRole("radio", { name: /JNE/ }).first()).toBeVisible();
  await page.getByRole("radio", { name: /JNE/ }).first().check();
  await page.getByLabel("Kode voucher").fill("PERTAMA");
  await page.getByRole("button", { name: "Pakai" }).click();
  await expect(page.getByText("Voucher PERTAMA dipakai.")).toBeVisible();
  await page.getByRole("button", { name: "Buat pesanan" }).click();

  await expect(page.getByRole("button", { name: "Konfirmasi pembayaran uji" })).toBeVisible();
  const orderNumber = await page.getByTestId("nomor-pesanan").innerText();
  await page.getByRole("button", { name: "Konfirmasi pembayaran uji" }).click();
  await expect(page.getByRole("paragraph").filter({ hasText: /^Lunas$/ })).toBeVisible();
  await expect(page.getByTestId("nomor-pesanan")).toHaveText(orderNumber);

  await page.goto("/admin/masuk");
  await page.getByLabel("Email").fill(process.env.SEED_ADMIN_EMAIL ?? "admin@teduh.id");
  await page.getByLabel("Kata sandi").fill(process.env.SEED_ADMIN_PASSWORD ?? "teduh-admin");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { name: "Ringkasan" })).toBeVisible();
  await page.getByRole("link", { name: "Pesanan" }).click();
  await expect(page.getByText(orderNumber)).toBeVisible();
});
