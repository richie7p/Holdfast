import { test, expect } from "@playwright/test";

test("stage selection, waves, pause and restart", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "固守", exact: true })).toBeVisible();
  await page.getByRole("button").filter({ hasText: "進攻" }).first().click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: /迅矢/ }).click();
  const box = await page.locator("canvas").boundingBox();
  if (!box) throw new Error("No canvas bounds");
  // Cell (1,1) is an open build cell in the first stage, mapped to CSS pixels.
  await page.locator("canvas").click({ position: { x: box.width * 1.5 / 14, y: box.height * 1.5 / 10 } });
  await expect(page.getByRole("button", { name: /拆除/ })).toBeVisible();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "暫停", exact: true }).click();
  await expect(page.getByRole("button", { name: "繼續駐守", exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("stage.png") });
  await page.getByRole("button", { name: "重開本關", exact: true }).click();
  await page.getByRole("button", { name: "暫停", exact: true }).click();
  await page.getByRole("button", { name: "返回關卡", exact: true }).click();
  await expect(page.getByRole("heading", { name: "固守", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("legacy save, export and corrupt-primary recovery", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("holdfast-progress-v1", JSON.stringify({ unlocked: 1, stars: [3] }));
  });
  await page.reload();
  await expect(page.getByText("星 3/18", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔" }).click();
  expect((await download).suggestedFilename()).toBe("holdfast-progress.json");
  await page.evaluate(() => {
    localStorage.setItem("holdfast-progress-v2", "null");
    localStorage.setItem("holdfast-progress-v2.bak", JSON.stringify({ unlocked: 2, stars: [3, 2] }));
  });
  await page.reload();
  await expect(page.getByText("星 5/18", { exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("已載入備份");
});
