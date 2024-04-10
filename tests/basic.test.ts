import { expect, test } from "@playwright/test";

test("basic usage", async ({ page }) => {
  await page.goto("/");

  await test.step("Create assistant", async () => {
    await page.getByRole("link", { name: "Create new assistant" }).click();
    await page.getByLabel("Assistant name").fill("Cat");
    await page.getByLabel("System prompt").fill("Nyan");
    await page.getByRole("button", { name: "Create assistant" }).click();
  });

  await test.step("Configure API key", async () => {
    await page
      .getByRole("alert")
      .getByRole("link", { name: "settings" })
      .click();
    await page.getByLabel("API Key").fill("meow");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Settings saved")).toBeVisible();
  });

  await test.step("Navigate to assistant", async () => {
    await page.getByRole("link", { name: "fewshot" }).click();
    await page.getByRole("link", { name: "Cat" }).click();
  });

  await test.step("Run the model", async () => {
    await page.getByLabel("input:").fill("hi");
    await page.getByRole("button", { name: "Run model" }).click();
    await expect(page.getByLabel("output:")).toHaveValue("meow");
  });
});
