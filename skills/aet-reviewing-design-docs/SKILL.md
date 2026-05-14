---
name: aet-reviewing-design-docs
description: Used to standardize the execution process of a certain Stage in aet, ensuring that deliverables are reviewed, revised, and aligned with user intent
metadata:
  pattern: pipeline
  steps: "5"
---

You are currently in the execution process of a Stage within a workflow, and you must strictly complete the stage objective according to the following steps.  
**If any step fails, you are prohibited from skipping it or continuing on your own. You must enter the corresponding revision path.**

---

## Process Overview

| Step | Name | Responsibility |
|------|------|------|
| **S1.0** | Execute | Load the stage Skill methodology and generate the first draft of the deliverable |
| **S1.1** | Post-initial-review Revision | Revise according to the Skill methodology + initial review comments |
| **S2** | HCritic Initial Review | First automated quality gate (revision limit: **2** rounds) |
| **S3** | Interactive Revision | User-driven document refinement (final draft editing) |
| **S1.2** | Post-re-review Revision | Revise according to the Skill methodology + re-review comments |
| **S4** | HCritic Re-review | Second automated quality gate (revision limit: **2** rounds) |
| **S5** | Handover | Trigger state transition and output the final deliverable |

---

## Flowchart

```mermaid
graph TD
    P1_0[S1.0 执行] --> S2{S2 初审}
    S2 -- 不通过 --> P1_1[S1.1 初审后修订] --> S2
    S2 -- 通过 --> S3[S3 创建快照·等待用户]
    S3 --> S3d{用户有批注?}
    S3d -- 是 --> S3fix[处理批注] --> S3
    S3d -- 否 --> S4[S4 复审]
    S4 --> S4skip{跳过复审判断}
    S4skip -- 无修改 --> S5[S5 准备交接]
    S4skip -- 修改≤50字 --> S5
    S4skip -- 修改>50字 --> S4ask{用户需要复审?}
    S4ask -- 跳过复审 --> S5
    S4ask -- 需要复审 --> S4r{S4 复审}
    S4r -- 不通过 --> P1_2[S1.2 复审后修订] --> S4
    S4r -- 通过 --> S5
```

---

## Loop Rules

| # | Rule |
|---|------|
| 1 | **Initial review loop** — P1 fails → S1.1 revision → return to P1, up to 2 rounds; if it still fails, terminate the process. |
| 2 | **S3 self-loop** — After each round of comment processing, recreate the snapshot and wait for the next round until the user confirms there are no more changes. Only then may you exit. |
| 3 | **S4 skip decision** — At S4 start: if no user modifications → skip to S5; if modifications ≤50 characters → skip to S5; if modifications >50 characters → ask user `是否需要进行复审？`, options `["需要复审", "跳过复审"]`. If user chooses "跳过复审" → S5; otherwise → proceed with S4. |
| 4 | **Re-review loop** — S4 fails → S1.2 revision → return to S4 (do not go back to P1), up to 2 rounds; if it still fails, terminate the process. |

---

## Execution Process

### [S1.0] Execute

> Load the methodology of the current stage Skill and generate the first draft of the deliverable strictly according to its guidance.

1. **Load Skill**
   - Identify and load the Skill files bound to the current stage (methodology, templates, specifications);
   - Progressively read supplementary information (`references`, `assets`, etc.) as required by the Skill;
   - If the Skill files are missing or incomplete → **terminate and report**.

2. **Generate First Draft**
   - Produce the first draft strictly according to the Skill methodology;
   - Generating based on guesswork without a Skill is strictly prohibited.

---

### [S2] HCritic Initial Review

> Delegate the S1.0 deliverable to HCritic for the first automated quality gate.

1. **Delegate Review**
   - delegate `HCritic` as the Subagent to review the stage document;
   - If there are multiple deliverables, each must be delegated separately; routing decisions are based on the **worst result**.

2. **Routing Decision**
   - Identify the review result
   - If it still fails after the **2nd round** → terminate the process and request user intervention;
   - Route:
     + **Fully passed** → S3 Interactive Revision;
     + **Conditionally passed** → S1.1 minor revision, then directly proceed to the next step → S3;
     + **Failed** → S1.1 revision, then return to S2.

---

### [S1.1] Post-initial-review Revision

> Perform targeted modifications to the deliverable according to the Skill methodology and the S2 initial review comments.

1. **Execute Revision**
   - Re-check the relevant sections of the Skill methodology;
   - Implement review revision instructions item by item;
   - If chain impacts are involved (such as terminology changes), the entire document must be updated consistently;
   - Introducing new non-conformities is prohibited.

2. **Routing Decision**
   - **Conditionally passed** → S3;
   - **Failed** → Return to S2 for initial review again.

---

### [S3] Interactive Revision

**Interactive Revision is a required stage and MUST NOT be skipped under any circumstances.**

1. **Load Skill**: `aet-interacting-with-users` skill MUST be loaded to provide the interactive revision functionality in this step.

2. **Check Skill Loading**: If the skill is not loaded successfully, ALWAYS ask the user if continue jump to S5 directly or not.

3. **Follow Sequence**: MUST follow the exact sequence defined in the aet-interacting-with-users skill.

4. **User-driven Revision**: Follow the user's comments to revise the document.

5. **Routing Decision**
   - If returns `canProceedToNextStep === true` (the user has no changes) → exit S3 → S4;
   - If the user has changes → process them and return to step 1 to begin a new S3 loop;
     + snapshots MUST be recreated because the old snapshots have been destroyed
     + modifying files without creating snapshots will pose a significant risk of corrupting the original files.

---

### [S4] HCritic Re-review

> Conduct the second automated quality gate on the deliverable after user modifications.

1. **Skip Decision**
   - Check modification statistics from S3 interactive revision:
     + If **no user modifications were made during the entire S3 process** → skip re-review and go directly to S5;
     + If **user made modifications AND total character changes >50** → ask user: `是否需要进行复审？`, options: `["需要复审", "跳过复审"]`
       - If user chooses "需要复审" → proceed with S4 review;
       - If user chooses "跳过复审" → S5 Handover;
     + If **user made modifications BUT total character changes ≤50** → skip re-review and go directly to S5.

2. **Delegate Review**
   - delegate `HCritic` to review the stage document;
   - If there are multiple deliverables, each must be delegated separately; routing decisions are based on the **worst result**.

3. **Routing Decision**
   - If it still fails after the **2nd round** → terminate the process and request user intervention;
   - Route:
     + **Fully passed** → S5 Handover;
     + **Conditionally passed** → S1.2 minor revision, then directly proceed to the next step → S5;
     + **Failed** → S1.2 revision, then return to S4.

---

### [S1.2] Post-re-review Revision

> Perform targeted modifications to the deliverable according to the Skill methodology and the S4 re-review comments.

1. **Execute Revision**
   - Re-check the relevant sections of the Skill methodology;
   - Implement review revision instructions item by item;
   - If chain impacts are involved, update the entire document consistently;
   - Introducing new non-conformities is prohibited.

2. **Routing Decision**
   - **Conditionally passed** → S5;
   - **Failed** → Return to S4 for re-review again.

---

### [S5] End

ONLY output `本阶段任务结束，再见。` and stop doing anything else.

**End Response**
- The orchestration system will handle the state transition after you finish your response;
- NEVER executing the next stage task.

---

## Global Constraints

1. **No skipping steps**: Every specified step is mandatory. DO NOT ignore any step, and NEVER use any excuse to skip any part of the prescribed pipeline.
2. **No fabrication**: All content must be based on the inputs and reference materials loaded in P1, and must not be fabricated out of thin air.
3. **Worst-result principle**: When there are multiple deliverables, each must be reviewed and revised separately, and the process follows the worst result.