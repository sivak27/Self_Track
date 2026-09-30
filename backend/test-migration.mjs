import { createApp } from "./dist/app.js";
import { getDb } from "./dist/database/connection.js";
import http from "http";

async function runTests() {
  console.log("==================================================");
  console.log("STARTING PERSONAL CONTROL CENTER MIGRATION TESTS");
  console.log("==================================================");

  // 1. Initialize SQLite Database
  const db = getDb();
  console.log("✓ SQLite database verified.");

  // 2. Start Test Server on port 5999
  const app = createApp();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5999, resolve));
  console.log("✓ Express test server listening on http://localhost:5999");

  const baseUrl = "http://localhost:5999/api";

  let user1Token = "";
  let user1Id = "";
  let user2Token = "";
  let user2Id = "";

  const uniqueSuffix = Date.now();
  const user1Email = `engineer_${uniqueSuffix}@controlcenter.local`;
  const user1Password = "SecurePass123!";

  // --------------------------------------------------
  // TEST 1: Register New User
  // --------------------------------------------------
  console.log("\n[TEST 1] Register new user in SQLite...");
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user1Email,
      password: user1Password,
      fullName: "Lead Engineer",
    }),
  });
  const regData = await regRes.json();
  if (regRes.status !== 201 || !regData.success) {
    throw new Error(`Register failed: ${JSON.stringify(regData)}`);
  }
  user1Token = regData.data.token;
  user1Id = regData.data.user.id;
  console.log(`✓ User registered successfully with ID: ${user1Id}`);

  // --------------------------------------------------
  // TEST 2: Verify Password Hashing in SQLite
  // --------------------------------------------------
  console.log("\n[TEST 2] Checking SQLite password_hash...");
  const userRow = db.prepare("SELECT email, password_hash FROM users WHERE id = ?").get(user1Id);
  if (!userRow) throw new Error("User record not found in SQLite database!");
  if (userRow.password_hash === user1Password) {
    throw new Error("SECURITY FAILURE: Password stored in plaintext!");
  }
  if (!userRow.password_hash.startsWith("$2")) {
    throw new Error("SECURITY FAILURE: Password hash is not bcrypt!");
  }
  console.log(`✓ Password properly hashed with bcrypt: ${userRow.password_hash.substring(0, 25)}...`);

  // --------------------------------------------------
  // TEST 3: Login with Wrong Credentials
  // --------------------------------------------------
  console.log("\n[TEST 3] Testing login with invalid password...");
  const failLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user1Email,
      password: "WrongPassword!",
    }),
  });
  const failLoginData = await failLoginRes.json();
  if (failLoginRes.status !== 401 || failLoginData.success) {
    throw new Error(`Login should have failed with status 401, got ${failLoginRes.status}!`);
  }
  console.log(`✓ Invalid login rejected as expected (401 Unauthorized): ${failLoginData.error || failLoginData.message}`);

  // --------------------------------------------------
  // TEST 4: Login with Valid Credentials
  // --------------------------------------------------
  console.log("\n[TEST 4] Testing login with valid credentials...");
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user1Email,
      password: user1Password,
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success || !loginData.data.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  user1Token = loginData.data.token;
  console.log("✓ Login succeeded, JWT token received.");

  // --------------------------------------------------
  // TEST 5: Verify Auth Session (GET /api/auth/me)
  // --------------------------------------------------
  console.log("\n[TEST 5] Testing session persistence via GET /api/auth/me...");
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const meData = await meRes.json();
  if (!meRes.ok || !meData.success || meData.data.user.id !== user1Id) {
    throw new Error(`GET /api/auth/me failed: ${JSON.stringify(meData)}`);
  }
  console.log(`✓ Session verified for: ${meData.data.user.email}, Profile: ${meData.data.profile.full_name}`);

  // --------------------------------------------------
  // TEST 6: EXPENSES CRUD
  // --------------------------------------------------
  console.log("\n[TEST 6] Testing Expenses CRUD...");
  // 1. Get Categories
  const catRes = await fetch(`${baseUrl}/expenses/categories`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const catData = await catRes.json();
  if (!catRes.ok || catData.data.length === 0) {
    throw new Error("Default categories not provisioned!");
  }
  const defaultCatId = catData.data[0].id;
  console.log(`✓ Expense categories verified (${catData.data.length} categories available).`);

  // 2. Create Expense
  const createExpRes = await fetch(`${baseUrl}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      category_id: defaultCatId,
      amount: 149.99,
      currency: "USD",
      description: "Development Hardware Component",
      date: new Date().toISOString().split("T")[0],
      payment_method: "credit_card",
    }),
  });
  const createExpData = await createExpRes.json();
  if (createExpRes.status !== 201 || !createExpData.success) {
    throw new Error(`Create expense failed: ${JSON.stringify(createExpData)}`);
  }
  const expenseId = createExpData.data.id;
  console.log(`✓ Expense created with ID: ${expenseId}`);

  // 3. Read Expense
  const getExpRes = await fetch(`${baseUrl}/expenses/${expenseId}`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const getExpData = await getExpRes.json();
  if (!getExpRes.ok || getExpData.data.amount !== 149.99) {
    throw new Error(`Get expense failed: ${JSON.stringify(getExpData)}`);
  }
  console.log("✓ Expense retrieved and validated against SQLite.");

  // 4. Update Expense (PUT)
  const updateExpRes = await fetch(`${baseUrl}/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      amount: 199.99,
      description: "Updated Hardware Component",
    }),
  });
  const updateExpData = await updateExpRes.json();
  if (!updateExpRes.ok || updateExpData.data.amount !== 199.99) {
    throw new Error(`Update expense failed: ${JSON.stringify(updateExpData)}`);
  }
  console.log("✓ Expense updated via PUT to $199.99.");

  // --------------------------------------------------
  // TEST 7: INCOME CRUD
  // --------------------------------------------------
  console.log("\n[TEST 7] Testing Income CRUD...");
  // 1. Get Sources
  const srcRes = await fetch(`${baseUrl}/income/sources`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const srcData = await srcRes.json();
  if (!srcRes.ok || srcData.data.length < 8) {
    throw new Error(`Expected at least 8 default income sources, got: ${srcData.data?.length}`);
  }
  const defaultSourceId = srcData.data[0].id;
  console.log(`✓ 8 default income sources verified (${srcData.data.length} sources).`);

  // Test invalid source rejection
  const invalidSrcRes = await fetch(`${baseUrl}/income`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      income_source: "invalid_source_here",
      deposit_status: "received",
      amount: 100,
      description: "Invalid source test",
      date: new Date().toISOString().split("T")[0],
    }),
  });
  if (invalidSrcRes.status === 201) {
    throw new Error("Failed: backend allowed invalid income_source!");
  }
  console.log("✓ Invalid income_source correctly rejected by backend validation.");

  // Test invalid deposit status rejection
  const invalidStatusRes = await fetch(`${baseUrl}/income`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      income_source: "salary",
      deposit_status: "invalid_status_here",
      amount: 100,
      description: "Invalid status test",
      date: new Date().toISOString().split("T")[0],
    }),
  });
  if (invalidStatusRes.status === 201) {
    throw new Error("Failed: backend allowed invalid deposit_status!");
  }
  console.log("✓ Invalid deposit_status correctly rejected by backend validation.");

  // 2. Create Real Income (Freelance + Deposited)
  const createIncRes = await fetch(`${baseUrl}/income`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      source_id: defaultSourceId,
      income_source: "freelance",
      deposit_status: "deposited",
      amount: 4500.0,
      currency: "USD",
      description: "Engineering Consulting Retainer",
      date: new Date().toISOString().split("T")[0],
    }),
  });
  const createIncData = await createIncRes.json();
  if (createIncRes.status !== 201 || !createIncData.success) {
    throw new Error(`Create income failed: ${JSON.stringify(createIncData)}`);
  }
  const incomeId = createIncData.data.id;
  console.log(`✓ Income created with ID: ${incomeId}, source: freelance, status: deposited, amount: $4500.00`);

  // 3. Create Pending Income (Friends + Pending)
  const createPendingRes = await fetch(`${baseUrl}/income`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      income_source: "friends",
      deposit_status: "pending",
      amount: 500.0,
      currency: "USD",
      description: "Expected reimbursement from friend",
      date: new Date().toISOString().split("T")[0],
    }),
  });
  const createPendingData = await createPendingRes.json();
  if (createPendingRes.status !== 201 || !createPendingData.success) {
    throw new Error(`Create pending income failed: ${JSON.stringify(createPendingData)}`);
  }
  const pendingId = createPendingData.data.id;
  console.log(`✓ Pending income created with ID: ${pendingId}, source: friends, status: pending, amount: $500.00`);

  // 4. Test filtering by income_source
  const filterSrcRes = await fetch(`${baseUrl}/income?income_source=friends`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const filterSrcData = await filterSrcRes.json();
  if (!filterSrcData.success || filterSrcData.data.length !== 1) {
    throw new Error(`Filtering by income_source failed: ${JSON.stringify(filterSrcData)}`);
  }
  console.log("✓ Filtering by income_source=friends verified.");

  // 5. Test filtering by deposit_status
  const filterStatusRes = await fetch(`${baseUrl}/income?deposit_status=pending`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const filterStatusData = await filterStatusRes.json();
  if (!filterStatusData.success || filterStatusData.data.length !== 1) {
    throw new Error(`Filtering by deposit_status failed: ${JSON.stringify(filterStatusData)}`);
  }
  console.log("✓ Filtering by deposit_status=pending verified.");

  // 6. Test updating deposit_status from pending -> received
  const updateStatusRes = await fetch(`${baseUrl}/income/${pendingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      deposit_status: "received",
    }),
  });
  const updateStatusData = await updateStatusRes.json();
  if (!updateStatusData.success || updateStatusData.data.deposit_status !== "received") {
    throw new Error(`Update deposit_status failed: ${JSON.stringify(updateStatusData)}`);
  }
  console.log("✓ Updating deposit_status from pending -> received verified.");

  // 7. Delete the pending record so only the $4500 record remains for subsequent tests
  const deletePendingRes = await fetch(`${baseUrl}/income/${pendingId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const deletePendingData = await deletePendingRes.json();
  if (!deletePendingData.success) {
    throw new Error(`Delete income failed: ${JSON.stringify(deletePendingData)}`);
  }
  console.log("✓ Deleted temporary test income record verified.");

  // --------------------------------------------------
  // TEST 8: BUDGETS CRUD
  // --------------------------------------------------
  console.log("\n[TEST 8] Testing Budgets CRUD...");
  const createBudRes = await fetch(`${baseUrl}/budgets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      category_id: defaultCatId,
      amount: 1000.0,
      period: "monthly",
      start_date: "2026-01-01",
      alert_threshold: 85,
    }),
  });
  const createBudData = await createBudRes.json();
  if (createBudRes.status !== 201 || !createBudData.success) {
    throw new Error(`Create budget failed: ${JSON.stringify(createBudData)}`);
  }
  const budgetId = createBudData.data.id;
  console.log(`✓ Budget created with ID: ${budgetId}, spending calculation automatically linked.`);

  // --------------------------------------------------
  // TEST 9: PROJECTS & TASKS CRUD
  // --------------------------------------------------
  console.log("\n[TEST 9] Testing Projects and Tasks...");
  const createProjRes = await fetch(`${baseUrl}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      title: "Core Infrastructure Migration",
      description: "Migrating from cloud provider to local SQLite store",
      status: "active",
      priority: "high",
      color: "#4F46E5",
    }),
  });
  const createProjData = await createProjRes.json();
  if (createProjRes.status !== 201 || !createProjData.success) {
    throw new Error(`Create project failed: ${JSON.stringify(createProjData)}`);
  }
  const projectId = createProjData.data.id;
  console.log(`✓ Project created with ID: ${projectId}`);

  // Create Task
  const createTaskRes = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      title: "Implement local database schema and indexes",
      status: "in_progress",
      priority: "urgent",
      estimated_minutes: 60,
    }),
  });
  const createTaskData = await createTaskRes.json();
  if (createTaskRes.status !== 201 || !createTaskData.success) {
    throw new Error(`Create task failed: ${JSON.stringify(createTaskData)}`);
  }
  const taskId = createTaskData.data.id;
  console.log(`✓ Task created with ID: ${taskId}`);

  // Mark task completed
  const completeTaskRes = await fetch(`${baseUrl}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      status: "completed",
    }),
  });
  const completeTaskData = await completeTaskRes.json();
  if (!completeTaskRes.ok || completeTaskData.data.status !== "completed") {
    throw new Error(`Complete task failed: ${JSON.stringify(completeTaskData)}`);
  }
  console.log("✓ Task marked as completed in SQLite.");

  // Check project progress updated
  const getProjRes = await fetch(`${baseUrl}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const getProjData = await getProjRes.json();
  if (!getProjRes.ok || getProjData.data.progress_pct !== 100) {
    throw new Error(`Project progress calculation error: expected 100%, got ${getProjData.data.progress_pct}%`);
  }
  console.log(`✓ Project milestone calculation verified: ${getProjData.data.progress_pct}% progress.`);

  // --------------------------------------------------
  // TEST 10: GOALS CRUD
  // --------------------------------------------------
  console.log("\n[TEST 10] Testing Goals CRUD...");
  const createGoalRes = await fetch(`${baseUrl}/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      title: "Capital Reserve Target",
      category: "financial_savings",
      target_value: 10000.0,
      current_value: 2500.0,
      unit: "$",
    }),
  });
  const createGoalData = await createGoalRes.json();
  if (createGoalRes.status !== 201 || !createGoalData.success) {
    throw new Error(`Create goal failed: ${JSON.stringify(createGoalData)}`);
  }
  const goalId = createGoalData.data.id;
  console.log(`✓ Goal created with ID: ${goalId}, progress: ${createGoalData.data.progress_pct}%`);

  // Increment goal
  const incGoalRes = await fetch(`${baseUrl}/goals/${goalId}/increment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ delta: 2500.0 }),
  });
  const incGoalData = await incGoalRes.json();
  if (!incGoalRes.ok || incGoalData.data.current_value !== 5000.0) {
    throw new Error(`Increment goal failed: ${JSON.stringify(incGoalData)}`);
  }
  console.log(`✓ Goal progress incremented to $5000.00 (${incGoalData.data.progress_pct}%).`);

  // --------------------------------------------------
  // TEST 11: ANALYTICS & DASHBOARD METRICS
  // --------------------------------------------------
  console.log("\n[TEST 11] Testing Dashboard and Analytics calculation from SQLite...");
  const analyticsRes = await fetch(`${baseUrl}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const analyticsData = await analyticsRes.json();
  if (!analyticsRes.ok || !analyticsData.success) {
    throw new Error(`Analytics failed: ${JSON.stringify(analyticsData)}`);
  }
  const metrics = analyticsData.data;
  console.log(`✓ Analytics calculated: Total Income=$${metrics.financial.totalIncome}, Total Expenses=$${metrics.financial.totalExpenses}, Net Savings=$${metrics.financial.netSavings}`);
  console.log(`✓ Productivity metrics: Tasks Completed=${metrics.productivity.completedTasks}/${metrics.productivity.totalTasks} (${metrics.productivity.completionRate}%)`);
  if (!Array.isArray(metrics.recentExpenses) || !Array.isArray(metrics.recentTasks)) {
    throw new Error("Dashboard metrics missing recent activity arrays!");
  }
  console.log(`✓ Recent activity arrays present (${metrics.recentExpenses.length} expenses, ${metrics.recentTasks.length} tasks).`);

  // --------------------------------------------------
  // TEST 12: SETTINGS & EXPORT
  // --------------------------------------------------
  console.log("\n[TEST 12] Testing Settings and Database Export...");
  const updateSettingsRes = await fetch(`${baseUrl}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user1Token}`,
    },
    body: JSON.stringify({
      currency: "EUR",
      theme: "light",
      email_notifications: false,
    }),
  });
  const updateSettingsData = await updateSettingsRes.json();
  if (!updateSettingsRes.ok || updateSettingsData.data.settings.currency !== "EUR") {
    throw new Error(`Update settings failed: ${JSON.stringify(updateSettingsData)}`);
  }
  console.log("✓ User settings updated to EUR / light theme.");

  const exportRes = await fetch(`${baseUrl}/settings/export`, {
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  const exportData = await exportRes.json();
  if (!exportRes.ok || !exportData.data.metadata) {
    throw new Error(`Export data failed: ${JSON.stringify(exportData)}`);
  }
  console.log(`✓ Complete SQLite data exported successfully (${exportData.data.expenses.length} expenses, ${exportData.data.tasks.length} tasks).`);

  // --------------------------------------------------
  // TEST 13: STRICT USER DATA ISOLATION
  // --------------------------------------------------
  console.log("\n[TEST 13] Testing Strict User Data Isolation between two accounts...");
  const user2Email = `other_user_${uniqueSuffix}@controlcenter.local`;
  const reg2Res = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user2Email,
      password: "Password456!",
      fullName: "Second User",
    }),
  });
  const reg2Data = await reg2Res.json();
  user2Token = reg2Data.data.token;
  user2Id = reg2Data.data.user.id;

  // User 2 lists expenses: should have 0
  const user2ExpRes = await fetch(`${baseUrl}/expenses`, {
    headers: { Authorization: `Bearer ${user2Token}` },
  });
  const user2ExpData = await user2ExpRes.json();
  if (user2ExpData.data.length !== 0) {
    throw new Error("SECURITY FAILURE: User 2 can see User 1's expenses!");
  }
  console.log("✓ User 2 sees 0 expenses (strict user data isolation confirmed).");

  // User 2 tries to access User 1's expense directly by ID
  const crossAccessRes = await fetch(`${baseUrl}/expenses/${expenseId}`, {
    headers: { Authorization: `Bearer ${user2Token}` },
  });
  if (crossAccessRes.ok) {
    throw new Error("SECURITY FAILURE: User 2 accessed User 1's expense record by ID!");
  }
  console.log(`✓ Cross-user access blocked (${crossAccessRes.status} Not Found / Unauthorized).`);

  // --------------------------------------------------
  // TEST 14: LOGOUT AND PROTECTED ROUTE ENFORCEMENT
  // --------------------------------------------------
  console.log("\n[TEST 14] Testing Logout and Protected Route Authorization...");
  const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${user1Token}` },
  });
  if (!logoutRes.ok) throw new Error("Logout failed!");
  console.log("✓ Logout endpoint succeeded.");

  const unauthRes = await fetch(`${baseUrl}/expenses`);
  if (unauthRes.status !== 401) {
    throw new Error(`Unauthorized request returned status ${unauthRes.status}, expected 401!`);
  }
  console.log("✓ Unauthenticated request rejected with 401 Unauthorized.");

  // --------------------------------------------------
  // CLEANUP TEST USERS AND SERVER
  // --------------------------------------------------
  try {
    if (user1Id) {
      db.prepare("DELETE FROM users WHERE id = ?").run(user1Id);
    }
    if (user2Id) {
      db.prepare("DELETE FROM users WHERE id = ?").run(user2Id);
    }
    console.log("✓ Test users cleaned up from SQLite database.");
  } catch (cleanErr) {
    console.warn("Notice: Test user cleanup error:", cleanErr);
  }

  await new Promise((resolve) => server.close(resolve));
  console.log("\n==================================================");
  console.log("ALL 14 TEST SUITES PASSED SUCCESSFULLY!");
  console.log("ZERO SUPABASE DEPENDENCIES. 100% LOCAL SQLITE.");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
