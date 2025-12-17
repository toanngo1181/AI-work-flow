/**
 * Smart Mock Image Generator
 * In a production app, this would connect to DALL-E 3 or Imagen 2.
 * Here, we map keywords to specific high-quality 3D renders from Unsplash
 * to simulate the "Nano Banana" aesthetic (Isometric, 3D, Colorful).
 */

const UNSPLASH_MAPPING: Record<string, string[]> = {
    // Abstract 3D Shapes & Colors
    'default': [
        'photo-1618005182384-a83a8bd57fbe', // Abstract fluid
        'photo-1633356122544-f134324a6cee', // 3D Shapes
        'photo-1614850523459-c2f4c699c52e', // Gradient sphere
        'photo-1618005198919-d3d4b5a92ead', // Liquid 3D
    ],
    // Tech & Robot
    'tech': [
        'photo-1581090464777-f3220bbe1b8b', // Robot arm
        'photo-1535378437327-b7149a516c32', // AI Brain
        'photo-1620712943543-bcc4688e7485', // AI chip
    ],
    // Documents & Office
    'doc': [
        'photo-1554224155-8d04cb21cd6c', // Financial
        'photo-1512314889357-e157c22f938d', // Notepad
    ],
    // Success / Start
    'success': [
        'photo-1519834785169-98be25ec3f84', // Celebration
        'photo-1454165804606-c3d57bc86b40', // Brainstorm
    ],
    // Error / Stop
    'error': [
        'photo-1525785967371-87ba44b3e6cf', // Stop sign concept
        'photo-1593062096033-9a26b09da705', // Red warning
    ]
};

const getKeywordCategory = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('robot') || t.includes('ai') || t.includes('tech') || t.includes('data')) return 'tech';
    if (t.includes('doc') || t.includes('file') || t.includes('paper') || t.includes('form')) return 'doc';
    if (t.includes('check') || t.includes('success') || t.includes('start') || t.includes('begin')) return 'success';
    if (t.includes('error') || t.includes('fail') || t.includes('stop') || t.includes('alert')) return 'error';
    return 'default';
};

export const generateNodeImage = async (prompt: string): Promise<string> => {
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const category = getKeywordCategory(prompt);
    const options = UNSPLASH_MAPPING[category];
    
    // Pick a random image from the category to add variety
    const imageId = options[Math.floor(Math.random() * options.length)];
    
    // Construct valid Unsplash Source URL (High quality, square-ish)
    return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=600&q=80`;
};