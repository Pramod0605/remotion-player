# remotion-player Automated Testing Plan

To ensure the player is functional and regressions are caught, we will implement the following:

## 1. Static Analysis (CI/CD)
- **Command**: `npm run lint` and `tsc -b`
- **Goal**: Catch type mismatches and linting errors before runtime.

## 2. Unit Testing (Vitest)
- **Scope**: test `getDuration` helper and sidebar selection logic.
- **Goal**: Verify core utility functions.

## 3. End-to-End Testing (Playwright)
- **Scope**:
    - Verify app loads on `localhost:5173`.
    - Verify sidebar click switches compositions.
    - Verify `Player` component is present and has controls.
- **Goal**: Verify user experience.

## 4. Composition Audit
- A script to verify that all files in `src/compositions/` export a valid `compositionConfig`.
