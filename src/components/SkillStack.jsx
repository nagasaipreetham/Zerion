import './SkillStack.css';

const SKILLS = [
  { name: 'React', file: 'react.svg' },
  { name: 'Node.js', file: 'nodejs.svg' },
  { name: 'Express', file: 'express.svg' },
  { name: 'MongoDB', file: 'mongodb.svg' },
  { name: 'JavaScript', file: 'javascript.svg' },
  { name: 'HTML5', file: 'html.svg' },
  { name: 'CSS3', file: 'css.svg' },
  { name: 'Java', file: 'java.svg' },
  { name: 'C Language', file: 'c.svg' },
  { name: 'MySQL', file: 'mysql.svg' },
  { name: 'Git', file: 'git.svg' },
  { name: 'GitHub', file: 'github.svg' },
  { name: 'Postman', file: 'postman.svg' },
  { name: 'Figma', file: 'figma.svg' },
  { name: 'Canva', file: 'canva.svg' },
  { name: 'Cloudflare', file: 'cloudflare.svg' },
  { name: 'GCP', file: 'google-cloud-platform.svg' },
  { name: 'OAuth', file: 'oauth.svg' },
  { name: 'Rest API', file: 'rest-api-icon.svg' },
  { name: 'AI API', file: 'api-ai.svg' }
];

export default function SkillStack() {
  return (
    <section className="skills-section">
      <div className="skills-list">
        {SKILLS.map((skill) => {
          const isMonochrome = ['rest-api-icon.svg', 'express.svg', 'github.svg'].includes(skill.file);
          return (
            <div key={skill.name} className="skill-item" data-tooltip={skill.name}>
              {isMonochrome ? (
                <div 
                  className="skill-logo-mask" 
                  style={{ '--svg-url': `url(/skillslogo/${skill.file})` }}
                />
              ) : (
                <img 
                  src={`/skillslogo/${skill.file}`} 
                  alt={skill.name} 
                  className="skill-logo-img" 
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
