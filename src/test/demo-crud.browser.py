import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path("/tmp/browser/database-crud")
ROOT.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width":1280,"height":1800})
        page = await context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('http://localhost:8080/onboarding',wait_until='networkidle')
        outcome = await page.evaluate('''async () => {
          const { supabase } = await import('/src/integrations/supabase/client.ts');
          const key = 'crud-test-20261113-1900';
          const invalidKey = 'crud-invalid-20261113-1900';
          const localBefore = localStorage.getItem('hola-ciudad-profile-v2');
          const { data: auth } = await supabase.auth.getSession();
          if (auth.session) throw new Error('The CRUD test requires a fresh unsigned browser');
          const before = await supabase.from('demo_profiles').select('*').order('sample_key');
          if (before.error) throw new Error('Cannot read fictional samples: ' + before.error.message);
          if (before.data.some(row => row.sample_key === key || row.sample_key === invalidKey))
            throw new Error('Test identifiers already exist; no existing record was touched');
          const sample = {
            sample_key: key, label: 'Prueba CRUD temporal · ficticia', is_fictional: true,
            origin: 'Otro país', arrival: 'Acabo de llegar', neighborhood: 'Casetas',
            interests: ['Cultura y museos'], goals: ['Conocer gente', 'Encontrar voluntariado'],
            desired_activities: ['Visitar museos', 'Aprender cerámica'], budget: 'Gratuito',
            company: 'Por mi cuenta', availability: ['Tardes'], onboarding_completed: true,
          };
          const results = { signedOut: true, originalCount: before.data.length };
          let created = false;
          try {
            const insert = await supabase.from('demo_profiles').insert(sample).select('*').single();
            if (insert.error) throw new Error('Create failed: ' + insert.error.message);
            created = true;
            if (insert.data.neighborhood !== 'Casetas' || insert.data.is_fictional !== true)
              throw new Error('Create returned unexpected values');
            results.create = { passed: true, neighborhood: insert.data.neighborhood };
            const read = await supabase.from('demo_profiles').select('*').eq('sample_key', key).single();
            if (read.error || JSON.stringify(read.data.goals) !== JSON.stringify(sample.goals) || JSON.stringify(read.data.desired_activities) !== JSON.stringify(sample.desired_activities))
              throw new Error('Read did not preserve free answers');
            results.read = { passed: true, freeGoalsAndActivities: true };
            const update = await supabase.from('demo_profiles').update({ neighborhood: 'Valdespartera', budget: 'Bajo (menos de 15 €)', availability: ['Mañanas','Fines de semana'] }).eq('sample_key',key).select('*').single();
            if (update.error) throw new Error('Update failed: ' + update.error.message);
            const updatedRead = await supabase.from('demo_profiles').select('*').eq('sample_key',key).single();
            if (updatedRead.error || updatedRead.data.neighborhood !== 'Valdespartera' || updatedRead.data.budget !== 'Bajo (menos de 15 €)' || updatedRead.data.availability.length !== 2)
              throw new Error('Updated values did not persist');
            results.update = { passed: true, neighborhood: updatedRead.data.neighborhood, budget: updatedRead.data.budget };
            const invalidInsert = await supabase.from('demo_profiles').insert({ ...sample, sample_key: invalidKey, is_fictional: false });
            if (!invalidInsert.error) throw new Error('Real-data flag was unexpectedly accepted');
            results.nonFictionalInsertBlocked = true;
            const invalidUpdate = await supabase.from('demo_profiles').update({ is_fictional: false }).eq('sample_key',key).select('sample_key');
            if (!invalidUpdate.error) throw new Error('Fictional flag was unexpectedly mutable to false');
            results.nonFictionalUpdateBlocked = true;
            const privateRead = await supabase.from('profiles').select('user_id').limit(1);
            if (!privateRead.error) throw new Error('Private table was unexpectedly readable without login');
            results.privateProfilesBlocked = true;
            const remove = await supabase.from('demo_profiles').delete().eq('sample_key',key).select('sample_key');
            if (remove.error || remove.data.length !== 1) throw new Error('Delete failed');
            created = false;
            const removed = await supabase.from('demo_profiles').select('sample_key').eq('sample_key',key);
            if (removed.error || removed.data.length !== 0) throw new Error('Deleted record is still present');
            results.delete = { passed: true, remainingTemporaryRows: 0 };
            const after = await supabase.from('demo_profiles').select('*').order('sample_key');
            if (after.error || JSON.stringify(after.data) !== JSON.stringify(before.data)) throw new Error('Original fictional samples were altered');
            if (localStorage.getItem('hola-ciudad-profile-v2') !== localBefore) throw new Error('Local answers were altered');
            results.originalSamplesUnchanged = true;
            results.localAnswersUnchanged = true;
            return results;
          } finally {
            if (created) {
              const cleanup = await supabase.from('demo_profiles').delete().eq('sample_key',key);
              if (cleanup.error) throw new Error('Cleanup failed for temporary sample');
            }
            const extra = await supabase.from('demo_profiles').select('sample_key').eq('sample_key',invalidKey);
            if (!extra.error && extra.data.length) {
              const cleanup = await supabase.from('demo_profiles').delete().eq('sample_key',invalidKey);
              if (cleanup.error) throw new Error('Cleanup failed for invalid sample');
            }
          }
        }''')
        (ROOT/'result.json').write_text(json.dumps(outcome,ensure_ascii=False,indent=2))
        print(json.dumps(outcome,ensure_ascii=False,indent=2))
        print('page_errors:',errors)
        await browser.close()

asyncio.run(main())
