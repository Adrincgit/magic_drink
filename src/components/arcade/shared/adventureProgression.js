// Stable IDs preserve collected stars and completed chapters from older saves.
export const PREVIOUS_CHAPTER_ORDER=[0,1,2,5,3,4];
export const CEMETERY_CHAPTER_ORDER=[0,1,2,5,3,6,4];
export const VILLAGE_CHAPTER_ORDER=[0,1,2,5,3,6,7,4];
export const CHAPTER_ORDER=[0,1,2,5,3,6,7,8,9,10,4];
export const maxChapterId=Math.max(...CHAPTER_ORDER);
export const chapterRank=id=>CHAPTER_ORDER.indexOf(id);
export const nextAdventureChapter=id=>chapterRank(id)<0?null:CHAPTER_ORDER[chapterRank(id)+1]??null;
export const lastChapterRank=CHAPTER_ORDER.length-1;
