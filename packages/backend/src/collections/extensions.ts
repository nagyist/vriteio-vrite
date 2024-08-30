import { Collection, Db, ObjectId } from "mongodb";
import { z } from "zod";
import { UnderscoreID, zodId } from "#lib/mongo";

// eslint-disable-next-line no-use-before-define
type ContextValue = string | number | boolean | ContextObject | ContextArray;

interface ContextObject {
  [x: string]: ContextValue;
}
interface ContextArray extends Array<ContextValue> {}

const contextValue: z.ZodType<ContextValue> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.lazy(() => z.record(contextValue)),
  z.lazy(() => z.array(contextValue))
]);
const contextObject = z.record(contextValue);
const extension = z.object({
  id: zodId().describe("ID of the extension installation"),
  name: z.string().describe("Name of the extension"),
  url: z.string().describe("URL of the extension"),
  config: contextObject.describe("Configuration of the extension"),
  token: z.string().describe("API Token of the extension"),
  data: z.any().optional().describe("Custom data of the extension")
});

interface Extension<ID extends string | ObjectId = string>
  extends Omit<z.infer<typeof extension>, "id"> {
  id: ID;
}
interface FullExtension<ID extends string | ObjectId = string> extends Extension<ID> {
  workspaceId: ID;
}

const getExtensionsCollection = (db: Db): Collection<UnderscoreID<FullExtension<ObjectId>>> => {
  return db.collection("extensions");
};

export { contextValue, contextObject, extension, getExtensionsCollection };
export type { Extension, FullExtension, ContextObject, ContextArray, ContextValue };
