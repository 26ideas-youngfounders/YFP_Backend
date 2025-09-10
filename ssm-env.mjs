// ssm-env.mjs
import { SSMClient, GetParametersByPathCommand, PutParameterCommand } from "@aws-sdk/client-ssm";

/**
 * Auto-load all params from SSM under a prefix into process.env.
 * Optionally upsert any existing envs back to SSM if missing.
 *
 * @param {object} opts
 * @param {string} opts.prefix    SSM path prefix, e.g. "/yfp-backend"
 * @param {string[]} [opts.keys]  Optional allowlist of env names to sync. If omitted, we load ALL under prefix.
 * @param {boolean} [opts.seedMissingFromEnv=true]  If true, write env values to SSM when parameter doesn't exist.
 * @param {string} [opts.region]  AWS region (defaults to process.env.AWS_REGION or "ap-south-1")
 */
export async function initEnvFromSSM({
  prefix,
  keys,
  seedMissingFromEnv = true,
  region = process.env.AWS_REGION || "ap-south-1",
} = {}) {
  if (!prefix?.startsWith("/")) throw new Error("SSM prefix must start with '/' (e.g. '/yfp-backend')");
  const ssm = new SSMClient({ region });

  // 1) Load EVERYTHING under the prefix into process.env
  let nextToken;
  do {
    const resp = await ssm.send(new GetParametersByPathCommand({
      Path: prefix,
      WithDecryption: true,
      Recursive: true,
      NextToken: nextToken,
    }));
    for (const p of resp.Parameters ?? []) {
      const name = p.Name.replace(`${prefix}/`, ""); // "YFP_NARATIVE_Q1"
      if (!keys || keys.includes(name)) {
        if (p.Value != null && process.env[name] == null) {
          process.env[name] = p.Value; // populate runtime env
        }
      }
    }
    nextToken = resp.NextToken;
  } while (nextToken);

  // 2) Optionally seed SSM with any envs that exist in process.env but are missing in SSM
  if (seedMissingFromEnv) {
    const toSeed = (keys ?? Object.keys(process.env))
      .filter(k => process.env[k] != null) // have a value
      .map(k => ({ Name: `${prefix}/${k}`, Value: String(process.env[k]) }));

    // We can't cheaply check existence in bulk; PutParameter with Overwrite=false will fail if exists — that's fine.
    for (const { Name, Value } of toSeed) {
      try {
        await ssm.send(new PutParameterCommand({
          Name,
          Value,
          Type: "String",     // you said non-sensitive
          Overwrite: false,   // never clobber existing SSM value
        }));
        // console.log(`Seeded SSM ${Name}`); // avoid noisy logs in production
      } catch (e) {
        // If it already exists, ignore; log other errors
        if (e?.name !== "ParameterAlreadyExists") {
          console.error(`Failed to seed ${Name}:`, e?.name || e?.message || e);
        }
      }
    }
  }
}
