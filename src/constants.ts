// Markdown for permission error
export const PERMISSION_COMMENT = `
<details>
  <summary>Error: Failed to update Pull Request</summary>
  <ul>
    <li>The branch update is currently blocked due to insufficient permissions.</li>
    <li>Please make sure that the necessary permissions are provided to proceed with the update.</li>
    <li>For more information, please refer to <a href="">this</a> document.</li>
  </ul>
</details>
`;

// Markdown for conflict error`
export const CONFLICT_COMMENT = `
<details>
  <summary>Error: Failed to update Pull Request</summary>
  <ul>
    <li>The branch update is currently blocked due to conflicts.</li>
    <li>Please make sure that the conflicts are resolved to proceed with the update.</li>
    <li>For more information, please refer to <a href="">this</a> document.</li>
  </ul>
</details>
`;

// Markdown for dirty error
export const DIRTY_COMMENT = `
<details>
  <summary>Error: Failed to update Pull Request</summary>
  <ul>
    <li>Pull request is dirty, merge-commit cannot be cleanly created</li>
    <li>Please make sure that the dirty state is resolved to proceed with the update.</li>
    <li>For more information, please refer to <a href="">this</a> document.</li>
  </ul>
</details>
`;
