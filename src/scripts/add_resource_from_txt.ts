import "dotenv/config";
import { createResource } from "../lib/api/resource.ts";

let content = "";

for await (const chunk of process.stdin) {
  content += chunk;
}

const result = await createResource({ content: content.trim() });

console.log(result);
process.exit(0);

// how to run `pnpm tsx src/scripts/add_resource_from_txt.ts < src/scripts/aa_info.txt`
