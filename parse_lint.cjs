const fs = require('fs');
try {
    const content = fs.readFileSync('lint_output.json', 'utf8');
    const results = JSON.parse(content);
    const problems = results.filter(r => r.errorCount > 0 || r.warningCount > 0);
    const lines = [];
    problems.forEach(p => {
        lines.push(p.filePath);
        p.messages.forEach(m => lines.push(`  ${m.severity}: ${m.message} (${m.ruleId}) at line ${m.line}`));
    });
    fs.writeFileSync('lint_report.txt', lines.join('\n'));
} catch (e) {
    console.error(e);
}
