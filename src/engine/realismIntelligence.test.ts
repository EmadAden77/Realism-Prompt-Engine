import assert from 'node:assert/strict';
import { summarizeSceneChanges } from './realismIntelligence';

{
  const result = summarizeSceneChanges(
    {
      cameraAngle: 'eye-level',
      lightingMode: 'إضاءة سقف',
      backgroundHumans: 'moderate',
      pose: 'واقف'
    },
    {
      cameraAngle: 'slightly-high',
      lightingMode: 'إضاءة شاشة الهاتف فقط',
      backgroundHumans: 'none',
      pose: 'واقف'
    }
  );

  assert.deepEqual(result.changedAreas, ['camera', 'lighting', 'background']);
  assert.match(result.summaryAR, /الكاميرا/);
  assert.match(result.summaryAR, /الإضاءة/);
  assert.match(result.summaryAR, /الخلفية/);
}

{
  const result = summarizeSceneChanges(
    { cameraAngle: 'eye-level', pose: 'واقف' },
    { cameraAngle: 'eye-level', pose: 'واقف' }
  );

  assert.deepEqual(result.changedFields, []);
  assert.deepEqual(result.changedAreas, []);
  assert.equal(result.summaryAR, 'المشهد متناسق ولم يحتج إلى تعديل');
}

console.log('realismIntelligence tests passed');
