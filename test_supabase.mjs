import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cocqnagdttwectnlcwib.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvY3FuYWdkdHR3ZWN0bmxjd2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjczMzYsImV4cCI6MjA4OTk0MzMzNn0.y9t0y54rm6JFtfg0Cow5cZ62-SiGqR8lMT3sgkzIr88';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
    console.log("Testing DB Insert...");
    const { data: dbData, error: dbError } = await supabase.from('media').insert([{ 
        year: 2024, url: "http://test.com/img.png", type: "image", caption: "test" 
    }]).select();
    
    if (dbError) {
        console.error("DB Error:", dbError);
    } else {
        console.log("DB Insert Success:", dbData);
        // clean up
        await supabase.from('media').delete().eq('id', dbData[0].id);
    }

    console.log("-".repeat(40));
    console.log("Testing Storage Upload...");
    const fileName = `test_file_${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('media').upload(fileName, "Hello World!");
    
    if (uploadError) {
        console.error("Storage Error:", uploadError);
    } else {
        console.log("Storage Upload Success:", uploadData);
        // clean up
        await supabase.storage.from('media').remove([fileName]);
    }
}

testSupabase();
