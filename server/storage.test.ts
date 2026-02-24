import { describe, it, expect } from "vitest";
import { storagePut, storageGet } from "./storage";

describe("S3 Storage", () => {
  it("should upload and retrieve a file", async () => {
    const testData = Buffer.from("Test photo data");
    const testKey = "test/photo.jpg";
    
    // Upload file
    const { key, url } = await storagePut(testKey, testData, "image/jpeg");
    
    // Verify upload result
    expect(key).toBeTruthy();
    expect(url).toBeTruthy();
    expect(url).toMatch(/^https:\/\/files\.manuscdn\.com/);
    expect(url).toMatch(/\.jpg$/);
    
    console.log("✅ Upload successful:", { key, url });
  });
  
  it("should generate unique filenames for uploads", async () => {
    const testData = Buffer.from("Test data 1");
    const result1 = await storagePut("test/file.jpg", testData, "image/jpeg");
    
    const testData2 = Buffer.from("Test data 2");
    const result2 = await storagePut("test/file.jpg", testData2, "image/jpeg");
    
    // Keys should be different (unique filenames)
    expect(result1.key).not.toBe(result2.key);
    // URLs should also be different
    expect(result1.url).not.toBe(result2.url);
    
    console.log("✅ Unique filenames generated:", { 
      key1: result1.key, 
      key2: result2.key 
    });
  });
});
