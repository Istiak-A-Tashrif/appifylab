import { expect, test } from "@playwright/test";

test("registration, feed interactions, authorization, and logout", async ({
  page,
}) => {
  const unique = Date.now();
  const postText = `E2E post ${unique}`;
  const commentText = `E2E comment ${unique}`;
  const replyText = `E2E reply ${unique}`;

  await page.goto("/feed");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/register");
  await page.getByLabel("First Name").fill("E2E");
  await page.getByLabel("Last Name").fill("User");
  await page.getByLabel("Email").fill(`e2e-${unique}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("correct-horse-battery");
  await page.getByLabel("Repeat Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Register now" }).click();
  await expect(page).toHaveURL(/\/feed$/);

  await page.locator("#floatingTextarea").fill(postText);
  await page.getByRole("button", { name: /Post$/ }).first().click();
  const card = page
    .locator("._feed_inner_timeline_post_area", { hasText: postText })
    .first();
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: /Like/ }).first().click();
  await expect(card.getByRole("button", { name: /Like/ }).first()).toHaveClass(
    /_feed_reaction_active/,
  );

  await card.getByRole("button", { name: "Comment" }).click();
  await card.getByPlaceholder("Write a comment").fill(commentText);
  await card
    .locator("._feed_inner_comment_box_form")
    .press("Control+Enter")
    .catch(() => undefined);
  await card
    .locator("._feed_inner_comment_box_form button[type=submit]")
    .click();
  await expect(card.getByText(commentText)).toBeVisible();
  await card.getByRole("button", { name: "Reply." }).last().click();
  await card.getByPlaceholder(/Reply to/).fill(replyText);
  await card.locator("._inline_reply button[type=submit]").click();
  await expect(card.getByText(replyText)).toBeVisible();

  const reply = card.locator("._comment_main", { hasText: replyText }).first();
  await reply.getByText("Like.", { exact: true }).click();
  await expect(reply.getByText("Unlike.", { exact: true })).toBeVisible();
  await reply.getByText("Unlike.", { exact: true }).click();
  await expect(reply.getByText("Like.", { exact: true })).toBeVisible();

  await page.locator("._header_logout_button:visible").first().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/feed");
  await expect(page).toHaveURL(/\/login$/);
});
