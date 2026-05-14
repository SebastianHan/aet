# Implementation Workflow

## Step 1: Read Design and Plan

- Read design document from provided path
- Read implementation plan for task breakdown
- Understand requirements and approach

### Implementation Plan Format (Checkbox Syntax)

The implementation plan **MUST use checkbox syntax** for task tracking:

```markdown
## Task 1: Component Name

**Files:**
- Create: `src/components/Component.tsx`
- Modify: `src/utils/helper.ts:10-20`
- Test: `tests/components/Component.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
describe('Component', () => {
  it('should render correctly', () => {
    // test code
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement minimal code**

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

---

## Task 2: Next Component

...
```

## Step 2: Execute Implementation

### For Each Task:
1. Follow each step exactly (plan has bite-sized steps)
2. Run verifications as specified
3. Mark task steps as completed by updating checkbox:
   - Change `- [ ]` to `- [x]` after completing each step
4. Commit after completing all steps in task

### Task Execution Example:
```
Task 1: User Authentication Component

Reading plan for Task 1...
Found 5 steps, all unchecked. Starting Task 1.

Executing Step 1: Write failing test
✓ Test written

Executing Step 2: Run test to verify it fails
✓ Test failed as expected

Executing Step 3: Implement minimal code
✓ Code implemented

Executing Step 4: Run test to verify it passes
✓ Test passed

Executing Step 5: Commit
✓ Committed

Updating Task 1 checkbox in plan file...
Moving to Task 2...
```

## Step 3: Return Implementation Result

- Return path to implementation documentation
- Report completion status