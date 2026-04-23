import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cocqnagdttwectnlcwib.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvY3FuYWdkdHR3ZWN0bmxjd2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjczMzYsImV4cCI6MjA4OTk0MzMzNn0.y9t0y54rm6JFtfg0Cow5cZ62-SiGqR8lMT3sgkzIr88'
);

async function run() {
  console.log("=== 1. CHECK MEDIA TABLE ===");
  const { data: mediaData, error: mediaError } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (mediaError) {
    console.error("Media table error:", mediaError);
  } else {
    console.log(`Total media items: ${mediaData.length}`);
    const byYear = {};
    mediaData.forEach(m => {
      byYear[m.year] = (byYear[m.year] || 0) + 1;
    });
    console.log("By year:", byYear);
    if (mediaData.length > 0) {
      console.log("Sample item:", JSON.stringify(mediaData[0], null, 2));
    }
  }

  console.log("\n=== 2. CHECK STORAGE BUCKET ===");
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error("Bucket list error:", bucketError);
  } else {
    console.log("Buckets:", buckets.map(b => `${b.name} (public: ${b.public})`));
  }

  console.log("\n=== 3. CHECK STORAGE FILES ===");
  const { data: files, error: filesError } = await supabase.storage.from('media').list('', { limit: 20 });
  if (filesError) {
    console.error("Storage list error:", filesError);
  } else {
    console.log("Root files/folders:", files.map(f => f.name));
    // Check each year folder
    for (const year of ['2021','2022','2023','2024','2025','2026']) {
      const { data: yearFiles } = await supabase.storage.from('media').list(year, { limit: 5 });
      if (yearFiles && yearFiles.length > 0) {
        console.log(`  ${year}/: ${yearFiles.length} files - ${yearFiles.map(f=>f.name).join(', ')}`);
      }
    }
  }

  console.log("\n=== 4. TEST INSERT + DELETE ===");
  const { data: inserted, error: insertErr } = await supabase
    .from('media')
    .insert([{ year: 9999, url: 'http://test.com/test.png', type: 'image', caption: 'test-delete-me' }])
    .select();
  
  if (insertErr) {
    console.error("INSERT FAILED:", insertErr);
  } else {
    console.log("INSERT OK:", inserted[0].id);
    const { error: delErr } = await supabase.from('media').delete().eq('id', inserted[0].id);
    if (delErr) console.error("DELETE FAILED:", delErr);
    else console.log("DELETE OK (cleaned up)");
  }

  console.log("\n=== 5. TEST STORAGE UPLOAD ===");
  const testFileName = `test_upload_${Date.now()}.txt`;
  const { data: upData, error: upErr } = await supabase.storage
    .from('media')
    .upload(testFileName, new Uint8Array([72, 101, 108, 108, 111]));
  
  if (upErr) {
    console.error("STORAGE UPLOAD FAILED:", upErr);
  } else {
    console.log("STORAGE UPLOAD OK:", upData.path);
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(testFileName);
    console.log("Public URL:", publicUrl);
    // cleanup
    await supabase.storage.from('media').remove([testFileName]);
    console.log("Cleaned up test file");
  }

  console.log("\n=== 6. CHECK CONTENT TABLE ===");
  const { data: cmsData, error: cmsErr } = await supabase.from('content').select('*');
  if (cmsErr) {
    console.error("Content table error:", cmsErr);
  } else {
    console.log(`Content keys: ${cmsData.length}`);
    cmsData.forEach(c => console.log(`  ${c.key}: "${(c.value||'').substring(0,50)}..."`));
  }

  console.log("\n=== 7. CHECK ACTIVITY LOGS ===");
  const { data: logsData, error: logsErr } = await supabase.from('activity_logs').select('*').limit(5);
  if (logsErr) {
    console.error("Activity logs error:", logsErr);
  } else {
    console.log(`Recent logs: ${logsData.length}`);
  }

  console.log("\n=== ALL CHECKS DONE ===");
}

run();
