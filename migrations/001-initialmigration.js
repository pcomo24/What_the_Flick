exports.up = (pgm, run) => {
  pgm.createTable('highscores', {
    id: 'id',
    username: 'varchar(45)',
    score: 'integer',
  });
  run();
};
exports.down = (pgm, run) => {
 pgm.dropTable('highscores');
 run();
};
