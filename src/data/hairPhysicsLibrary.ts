export interface HairPhysicsPreset {
  id: string;
  labelAR: string;
  categoryAR: string;
  prompt: string;
}

export const HAIR_PHYSICS_PRESETS: HairPhysicsPreset[] = [
  {
    id: 'hp_auto',
    labelAR: 'تلقائي حسب المشهد',
    categoryAR: 'تلقائي',
    prompt: 'natural hair, beard, and moustache physics appropriate to the resolved airflow, movement, headwear, moisture, and light without inventing unsupported effects',
  },
  {
    id: 'hp01',
    labelAR: 'جذر يرتفع + فروة ظاهرة',
    categoryAR: 'الجذور والفروة',
    prompt: 'roots lifting scalp visible parting shifting scalp oily pores clumping 3-4 strands heavier near ears inertia lagging lighter flyaways scalp visible at parting line roots lifting oily scalp pores visible clumping',
  },
  {
    id: 'hp02',
    labelAR: 'خصلة 3-4 شعرات ثقيلة عند الأذن',
    categoryAR: 'الخصل والثقل',
    prompt: 'clumping 3-4 strands heavier near ears inertia lagging lighter flyaways hair clumping 3-4 strands together heavier near ears inertia lagging behind head movement lighter flyaways escaping',
  },
  {
    id: 'hp03',
    labelAR: 'هالة flyaways ثابتة 2-3cm',
    categoryAR: 'الشعر الخفيف والهالة',
    prompt: 'flyaways halo static 2-3cm halo baby hairs sodium backlight orange rim translucent micro-shadows flyaways static 2-3cm halo around head baby hairs static electricity sodium backlight orange rim translucent micro-shadows on forehead',
  },
  {
    id: 'hp04',
    labelAR: 'تأخر inertia 0.2 ثانية + ريح',
    categoryAR: 'الحركة والقصور الذاتي',
    prompt: 'lag 0.2s inertia lagging lighter flyaways gravity down wind tips 15deg lower layer neck heavier unaffected light breeze 8km/h left consistent tips 15deg right hair lag 0.2s inertia behind head movement gravity down wind tips 15deg right lower layer neck heavier unaffected by wind',
  },
  {
    id: 'hp05',
    labelAR: 'شارب يرتفع 1mm مع الزفير',
    categoryAR: 'شارب ولحية وعقال',
    prompt: 'mustache lifting exhale vapor sideburn separate stubble not moving longer tip 5deg shadow neck mustache lifting 1mm exhale escaping edges flattened agal crease mustache hairs lifting 1mm on exhale breath vapor sideburn separate from beard stubble not moving longer hair tip 5deg shadow on neck escaping edges flattened agal crease',
  },
  {
    id: 'hp06',
    labelAR: 'شفافية برتقالية orange rim',
    categoryAR: 'الإضاءة الخلفية',
    prompt: 'translucent orange rim beard delayed inertia 0.2s hair backlit translucent tips orange rim 15deg specular oily hair translucent backlit orange rim 15deg specular oily beard delayed inertia 0.2s',
  },
  {
    id: 'hp07',
    labelAR: 'هالة static + تشابك X',
    categoryAR: 'الشعر الخفيف والهالة',
    prompt: 'static cling contrast flattened vs escaping flyaways static 2-3cm halo baby hairs friction tangle sebum oil X shape crossing catching on ear static cling contrast flattened hair vs escaping flyaways static 2-3cm halo baby hairs friction tangle sebum oil X shape crossing hair catching on ear',
  },
  {
    id: 'hp08',
    labelAR: 'فروة دهنية + مسام ظاهرة',
    categoryAR: 'الجذور والفروة',
    prompt: 'scalp oily pores scalp oily pores visible at roots parting shifting scalp oily sebum',
  },
  {
    id: 'hp09',
    labelAR: 'فرق الشعر يتحرك',
    categoryAR: 'الجذور والفروة',
    prompt: 'parting shifting parting line shifting scalp visible parting moving hair parting shifting',
  },
  {
    id: 'hp10',
    labelAR: 'خصلة ثقيلة عند الأذن + inertia',
    categoryAR: 'الخصل والثقل',
    prompt: 'inertia lagging lighter flyaways clumping 3-4 strands heavier near ears inertia lagging behind head movement lighter flyaways escaping static',
  },
  {
    id: 'hp11',
    labelAR: 'baby hairs مع sodium backlight',
    categoryAR: 'الإضاءة الخلفية',
    prompt: 'baby hairs sodium backlight orange rim translucent micro-shadows baby hairs around forehead sodium backlight orange rim translucent micro-shadows',
  },
  {
    id: 'hp12',
    labelAR: 'هالة 2-3cm حول الرأس',
    categoryAR: 'الشعر الخفيف والهالة',
    prompt: 'static 2-3cm halo halo around head static electricity 2-3cm baby hairs halo',
  },
  {
    id: 'hp13',
    labelAR: 'الجذور ترتفع مع الزفير',
    categoryAR: 'الجذور والفروة',
    prompt: 'roots lifting with breath vapor roots lifting scalp visible with breath exhale vapor',
  },
  {
    id: 'hp14',
    labelAR: 'طبقة الرقبة أثقل ولا تتأثر بالريح',
    categoryAR: 'الحركة والقصور الذاتي',
    prompt: 'lower layer neck heavier unaffected lower layer hair near neck heavier unaffected by light breeze 8km/h upper layer tips 15deg right',
  },
  {
    id: 'hp15',
    labelAR: 'ريح خفيفة 8km/h من اليسار',
    categoryAR: 'الحركة والقصور الذاتي',
    prompt: 'light breeze 8km/h left consistent light breeze 8km/h from left consistent direction hair tips 15deg right',
  },
  {
    id: 'hp16',
    labelAR: 'أطراف 15 درجة يمين',
    categoryAR: 'الحركة والقصور الذاتي',
    prompt: 'tips 15deg right hair tips 15deg to right wind direction light breeze 8km/h left tips right',
  },
  {
    id: 'hp17',
    labelAR: 'سوالف منفصلة عن اللحية',
    categoryAR: 'شارب ولحية وعقال',
    prompt: 'sideburn separate stubble sideburn separate from beard stubble not connected',
  },
  {
    id: 'hp18',
    labelAR: 'شعر قصير ثابت لا يتحرك',
    categoryAR: 'شارب ولحية وعقال',
    prompt: 'stubble not moving short stubble not moving longer hair moving stubble static',
  },
  {
    id: 'hp19',
    labelAR: 'طرف أطول 5 درجات + ظل رقبة',
    categoryAR: 'شارب ولحية وعقال',
    prompt: 'longer tip 5deg shadow neck longer hair tip 5deg shadow on neck',
  },
  {
    id: 'hp20',
    labelAR: 'شارب 1mm مع الزفير + أطراف هاربة',
    categoryAR: 'شارب ولحية وعقال',
    prompt: 'mustache lifting 1mm exhale escaping edges flattened agal crease mustache lifting 1mm on exhale escaping edges flattened agal crease visible',
  },
  {
    id: 'hp21',
    labelAR: 'ضغط العقال + شعر مسطح',
    categoryAR: 'شارب ولحية وعقال',
    prompt: 'agal crease flattened agal crease headband crease flattened hair under agal',
  },
  {
    id: 'hp22',
    labelAR: 'شعر شفاف برتقالي بضوء خلفي',
    categoryAR: 'الإضاءة الخلفية',
    prompt: 'hair backlit translucent tips orange rim 15deg specular oily hair translucent when backlit orange rim 15deg specular highlight oily sebum',
  },
  {
    id: 'hp23',
    labelAR: 'لحية تتأخر 0.2 ثانية',
    categoryAR: 'شارب ولحية وعقال',
    prompt: 'beard delayed inertia 0.2s beard inertia delayed 0.2s behind head movement',
  },
  {
    id: 'hp24',
    labelAR: 'أطراف شفافة برتقالية + specular oily',
    categoryAR: 'الإضاءة الخلفية',
    prompt: 'translucent tips orange rim 15deg specular oily hair tips translucent orange rim 15deg specular highlight oily',
  },
  {
    id: 'hp25',
    labelAR: 'تشابك X يعلق على الأذن',
    categoryAR: 'الخصل والثقل',
    prompt: 'X shape crossing catching on ear hair X shape crossing catching on ear friction tangle',
  },
  {
    id: 'hp26',
    labelAR: 'تزييت sebum oil',
    categoryAR: 'الجذور والفروة',
    prompt: 'sebum oil sebum oil scalp oily sebum oil secretion scalp',
  },
  {
    id: 'hp27',
    labelAR: 'احتكاك وتشابك friction tangle',
    categoryAR: 'الخصل والثقل',
    prompt: 'friction tangle hair friction tangle sebum oil tangled hair',
  },
  {
    id: 'hp28',
    labelAR: 'شعر مسطح مقابل flyaways هاربة',
    categoryAR: 'الشعر الخفيف والهالة',
    prompt: 'contrast flattened vs escaping contrast flattened hair vs escaping flyaways flattened under agal vs escaping baby hairs halo',
  },
  {
    id: 'hp29',
    labelAR: 'ثقل 3-4 شعرات معًا عند الأذن',
    categoryAR: 'الخصل والثقل',
    prompt: 'clumping 3-4 strands heavier near ears heavier near ears clumping 3-4 strands together',
  },
  {
    id: 'hp30',
    labelAR: 'تأخر inertia + flyaways خفيفة',
    categoryAR: 'الحركة والقصور الذاتي',
    prompt: 'lag 0.2s inertia lagging lighter flyaways inertia lagging 0.2s lighter flyaways escaping',
  },
  {
    id: 'hp31',
    labelAR: 'جاذبية للأسفل + أطراف مع الريح',
    categoryAR: 'الحركة والقصور الذاتي',
    prompt: 'gravity down wind tips 15deg gravity down wind tips 15deg right light breeze 8km/h left',
  },
  {
    id: 'hp32',
    labelAR: 'طبقة رقبة سفلية ثقيلة ثابتة',
    categoryAR: 'الحركة والقصور الذاتي',
    prompt: 'lower layer neck heavier unaffected lower layer neck heavier unaffected by wind upper layer moving',
  },
  {
    id: 'hp33',
    labelAR: 'هالة static 2-3cm',
    categoryAR: 'الشعر الخفيف والهالة',
    prompt: 'halo static 2-3cm halo baby hairs static halo 2-3cm around head baby hairs',
  },
  {
    id: 'hp34',
    labelAR: 'شفافية مع sodium خلفي برتقالي',
    categoryAR: 'الإضاءة الخلفية',
    prompt: 'sodium backlight orange rim translucent micro-shadows sodium backlight orange rim translucent hair micro-shadows',
  },
  {
    id: 'hp35',
    labelAR: 'ظلال flyaways صغيرة على الجبهة',
    categoryAR: 'الإضاءة الخلفية',
    prompt: 'micro-shadows on forehead micro-shadows from flyaways on forehead translucent',
  },
  {
    id: 'hp_core7',
    labelAR: 'حزمة مختصرة - 7 فيزياء شعر أساسية',
    categoryAR: 'حزم مركبة',
    prompt: 'roots lifting scalp visible parting shifting scalp oily pores clumping 3-4 strands heavier near ears inertia lagging lighter flyaways + clumping 3-4 strands heavier near ears inertia lagging lighter flyaways + flyaways halo static 2-3cm halo baby hairs sodium backlight orange rim translucent micro-shadows + lag 0.2s inertia lagging lighter flyaways gravity down wind tips 15deg lower layer neck heavier unaffected light breeze 8km/h left consistent tips 15deg right + mustache lifting exhale vapor sideburn separate stubble not moving longer tip 5deg shadow neck mustache lifting 1mm exhale escaping edges flattened agal crease + translucent orange rim beard delayed inertia 0.2s hair backlit translucent tips orange rim 15deg specular oily + static cling contrast flattened vs escaping flyaways static 2-3cm halo baby hairs friction tangle sebum oil X shape crossing catching on ear',
  },
  {
    id: 'hp_full',
    labelAR: 'حزمة كاملة - جميع فيزياء الشعر',
    categoryAR: 'حزم مركبة',
    prompt: 'roots lifting scalp visible parting shifting scalp oily pores clumping 3-4 strands heavier near ears inertia lagging lighter flyaways + clumping 3-4 strands heavier near ears inertia lagging lighter flyaways + flyaways halo static 2-3cm halo baby hairs sodium backlight orange rim translucent micro-shadows + lag 0.2s inertia lagging lighter flyaways gravity down wind tips 15deg lower layer neck heavier unaffected light breeze 8km/h left consistent tips 15deg right + mustache lifting exhale vapor sideburn separate stubble not moving longer tip 5deg shadow neck mustache lifting 1mm exhale escaping edges flattened agal crease + translucent orange rim beard delayed inertia 0.2s hair backlit translucent tips orange rim 15deg specular oily + static cling contrast flattened vs escaping flyaways static 2-3cm halo baby hairs friction tangle sebum oil X shape crossing catching on ear + scalp oily pores parting shifting + baby hairs sodium backlight orange rim translucent micro-shadows + lower layer neck heavier unaffected + light breeze 8km/h left consistent tips 15deg right + sideburn separate stubble not moving + longer tip 5deg shadow neck + mustache lifting 1mm exhale escaping edges flattened agal crease + hair backlit translucent tips orange rim 15deg specular oily + beard delayed inertia 0.2s + X shape crossing catching on ear + sebum oil + friction tangle + contrast flattened vs escaping + clumping 3-4 strands heavier near ears + gravity down wind tips 15deg + halo static 2-3cm + sodium backlight orange rim translucent micro-shadows + micro-shadows on forehead',
  },
];

export const getHairPhysicsPreset = (
  id: string | undefined
): HairPhysicsPreset =>
  HAIR_PHYSICS_PRESETS.find(item => item.id === id) ||
  HAIR_PHYSICS_PRESETS[0];
