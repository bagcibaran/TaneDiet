# Go-live preparation, part 1 (A4-A5, server-independent): implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** five backend changes that must land before go-live.
1. Spring Boot patch upgrade.
2. Per-request user check for every role.
3. One time zone everywhere.
4. A constant query count for the client list.
5. A safe catch-all for unexpected errors, plus quieter logs.

**Architecture:**
- Small, local changes in the existing layers.
- One new class: `config/UnexpectedErrorResolver`, registered after Spring's own resolvers.

**Tech Stack:** Spring Boot 4.1.x, Java 25, JUnit 5 + Mockito, MySQL.

**Spec:** `docs/superpowers/specs/2026-10-30-canliya-hazirlik-a4-design.md`

## Global Constraints

- TDD: write the failing test first, watch it fail, then implement.
- Unit suite command (run from `project/`):
  ```
  mvnw.cmd -q test "-Dtest=$(cat ../.superpowers/suite.txt)"
  ```
  Add every new test class to `.superpowers/suite.txt`.
- Context test:
  ```
  mvnw.cmd -q test "-Dtest=ProjectApplicationTests" "-Dspring.profiles.active=local"
  ```
- Never run `mvnw clean`. Never touch the user's server on :8080; end-to-end checks run on :8081.
- No personal data in logs: no usernames, emails, request bodies or real paths.
- Backend messages are Turkish.
- The user commits.

## Review Focus

1. **A dietitian token for a user who no longer exists, or whose DB role changed:** must get 401 on protected paths, not 403 and not success. Covered by Task 2 tests.
2. **Errors Spring already handles** (bad JSON, `/clients/abc`, unknown route) must keep today's status codes after Task 5. Covered by the Task 6 end-to-end check.
3. **`newWeightCount`** must count only client-entered weights after the last review, or all of them when there is no review. A dietitian-entered weight never counts. Covered by Task 4 tests and the e2e check.
4. **"Today" between 00:00 and 03:00 Istanbul time while the JVM is in UTC** must still be the Istanbul date. Covered by Task 3 tests (fixed clock) and the default-zone test.
5. **Invite token never in logs:** the resolver logs the route pattern, not the URI. Covered by a Task 5 test.

---

### Task 1: Spring Boot 4.1.1 → 4.1.2

**Files:** Modify `project/pom.xml` (parent version).

- [ ] **Step 1:** Change the parent `<version>` to `4.1.2`.
- [ ] **Step 2:** Check the Tomcat version.
  - Run:
    ```
    mvnw.cmd -q dependency:tree -Dincludes=org.apache.tomcat.embed:tomcat-embed-core
    ```
  - Expected: a version ≥ 11.0.24.
- [ ] **Step 3:** Run the unit suite and the context test. Expected: all pass.

### Task 2: Per-request user check for every role

**Files:** Modify `security/JwtAuthFilter.java`, `security/JwtAuthFilterTest.java`.

**Behaviour (`doFilterInternal`):**
- On a non-open path, for any role, load the user with `findByUsername`.
- If the user is missing, or `user.getRole().name()` differs from the token role: continue the chain **without** authentication (the protected path gets 401).
- If the role is `CLIENT`: run the lock check (423), then the consent check (428), as today.
- Open paths (`/auth/`, `/legal/`) keep today's behaviour: no DB lookup, and authentication is set from the token.

- [ ] **Step 1: Write the tests:**
  - `deletedDietitianIsUnauthenticated`:
    - DIETITIAN token, repository returns empty;
    - expect the chain is called and no authentication is set.
  - `roleChangedIsUnauthenticated`:
    - DIETITIAN token, the DB user is a CLIENT;
    - expect no authentication.
  - `activeDietitianIsAuthenticated`:
    - expect the authority to be `ROLE_DIETITIAN`.
  - `openPathDoesNotLoadUser`:
    - DIETITIAN token on `/auth/invites/x`;
    - expect `verify(userRepository, never()).findByUsername(any())`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the suite. Expected: PASS.

### Task 3: One time zone

**Files:**
- Modify:
  - `config/TimeConfig.java`: add `public static final ZoneId ZONE` and `public static void applyDefaultZone()`, which calls `TimeZone.setDefault(TimeZone.getTimeZone(ZONE))`; the `clock()` bean uses `ZONE`;
  - `ProjectApplication.main`: call `TimeConfig.applyDefaultZone()` before `run`;
  - `service/impl/WeightEntryService.java`: `buildSummary` uses `LocalDate.now(clock)`. Inject `Clock` if it is missing;
  - `service/impl/IntakeFormService.java`: the consent time and the seed weight date use `clock`;
  - `dto/IntakeFormResponse.java`: constructor `(IntakeForm form, LocalDate today)`;
  - every caller of that constructor (`IntakeFormService`, `ClientDataService`) passes `LocalDate.now(clock)`.
- Tests:
  - `config/TimeConfigTest`: `applyDefaultZoneSetsIstanbul`. Restore the previous default in `@AfterEach`.
  - `IntakeFormServiceTest`: `firstSaveUsesClockDateForSeedWeight`. The clock is fixed at 2026-10-29T22:30Z, so the Istanbul date is 2026-10-30. Assert that `measuredOn` is 2026-10-30.
  - `IntakeFormResponse` age: `ageUsesGivenDate`. Birth date 1990-10-31 and today 2026-10-30 → 35.
  - `WeightEntryService`, if it has no test class: `WeightEntryServiceTest.summaryUsesClockToday`. The clock is at 2026-10-29T22:30Z. With entries on 2026-10-23 and 2026-10-30, `changeLast7DaysKg` is computed from 2026-10-23.
- [ ] **Steps:** write the tests → see them FAIL → implement → run the suite and the context test → PASS.

### Task 4: Client list with a constant number of queries

**Files:**
- Modify the repositories:
  - `ClientReviewRepository`: `List<ClientReview> findAllByClientIn(Collection<User>)`;
  - `IntakeFormRepository`: `List<IntakeForm> findAllByUserIn(Collection<User>)`;
  - `DietPlanRepository`: `@Query("select distinct p.client.id from DietPlan p") List<Long> findClientIdsWithPlan()`;
  - `WeightEntryRepository`, one grouped query:
    ```
    @Query("select w.user.id, count(w) from WeightEntry w left join ClientReview r on r.client = w.user where w.enteredBy = w.user and (r.id is null or w.createdAt > r.reviewedAt) group by w.user.id")
    List<Object[]> countNewClientWeights();
    ```
- Modify `ClientReviewService.listClients`: build maps by client id from the four results and keep the output identical. `intakeStatus(Optional<IntakeForm>, Optional<ClientReview>)` is unchanged.
- Test: update `ClientReviewServiceTest` for the list scenarios (missing intake, new weights, seen, updated) to stub the batch methods. Add `listUsesConstantQueries` with two clients: each batch method is called exactly once, and the per-client methods (`findByClient`, `findByUser`, `existsByClient`, `countByUserAndEnteredByAndCreatedAtAfter`) are never called.
- [ ] **Steps:** tests → FAIL → implement → suite + context test (the JPQL is validated at startup) → PASS.

### Task 5: Catch-all for unexpected errors, quieter logs

**Files:**
- Create `config/UnexpectedErrorResolver.java`: `implements HandlerExceptionResolver`.
  - `resolveException`:
    - client abort (`AsyncRequestNotUsableException`, or a class whose simple name is `ClientAbortException`): return `null` without logging;
    - otherwise:
      - `log.error("Beklenmeyen hata: {} {}", method, pattern, ex)`. `pattern` is the request attribute `HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE`, or `"(eşleşmeyen yol)"` when it is missing.
      - Write 500 JSON `{"status":500,"message":"Beklenmeyen bir hata oluştu"}` and return an empty `ModelAndView`.
- Create `config/WebConfig.java` (`WebMvcConfigurer`):
  - `extendHandlerExceptionResolvers(list)` adds the resolver **last**;
  - the resolver is a `@Component` or is constructed here.
- Modify `application.properties`:
  - `spring.jpa.show-sql=false`;
  - `logging.level.com.project.project=INFO`.
- Test `config/UnexpectedErrorResolverTest`:
  - `unexpectedErrorIs500WithGenericMessage` (body has no exception message);
  - `logsPatternNotRealPath`: pattern `/auth/invites/{token}`, URI `/auth/invites/SECRET`; capture the log with a Logback `ListAppender` and assert it contains `{token}` and not `SECRET`;
  - `clientAbortIsIgnored`: returns `null` and writes nothing.
- [ ] **Steps:** tests → FAIL → implement → suite + context → PASS.

### Task 6: End-to-end check, docs

- [ ] **Step 1: Test API on :8081.** Check:
  - a DIETITIAN token gets 200 on `/clients`;
  - after the role is set to CLIENT with SQL, the same token → 401;
  - after deleting the temporary dietitian, its token → 401.
- [ ] **Step 2: Errors Spring already handles keep their status:**
  - `POST /weights` with malformed JSON → 400;
  - `POST /weights` with an unknown field → 400;
  - `GET /clients/abc` → 400;
  - `GET /nope` → 404.
- [ ] **Step 3:** Client list counts. Two temporary clients: one with self-entered weights after a review and one never reviewed. The counts must match the old behaviour (expected values computed by hand).
- [ ] **Step 4:** `CLAUDE.md`:
  - time zone: default zone set in `main`, `TimeConfig.ZONE`;
  - every role checked per request;
  - `UnexpectedErrorResolver`;
  - `show-sql` off.

  `DEVAM_NOTU.md`: A4-A5 part 1 done; part 2 waits for the server choice.
- [ ] **Step 5:** Clean up, and give the user the commit message.
