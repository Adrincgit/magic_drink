// Hand-drawn cels share one atlas; every visitor has its own UV window and
// phase. Camera travel never drives a walk cycle or resets the ambient clock.
export function createAtriumVisitors({ walkers, shoppers, grounded, shadow, textures, project }) {
  const people = [];
  function visitor({ id, atlas = walkers, row = 0, columns = 4, rows = 2, height = 4,
    x = 0, z, direction = 1, speed = 0, phase = 0 }) {
    const map = atlas.clone(); map.repeat.set(1 / columns, 1 / rows); map.needsUpdate = true; textures.push(map);
    const body = grounded(map, height, height, x, z, 488 / 512);
    body.scale.x = direction;
    body.material.alphaTest = .22;
    body.material.alphaToCoverage = true;
    const contact = shadow(x, z, speed ? 1.55 : 2.4, .65);
    const entry = { id, body, contact, row, columns, rows, x, z, direction, speed, phase, cel: -1, map };
    people.push(entry); return entry;
  }
  // Two separated pedestrian lanes per bay. Resets occur behind the sidewalls.
  visitor({ id: 'near-woman', row: 0, z: -2, speed: 1.4, phase: 8 });
  visitor({ id: 'near-man', row: 1, z: -4, speed: 1.5, phase: 20, direction: -1, height: 4.2 });
  visitor({ id: 'middle-woman', row: 0, z: -18, speed: 1.35, phase: 20 });
  visitor({ id: 'middle-man', row: 1, z: -20, speed: 1.5, phase: 9, direction: -1, height: 4.2 });
  visitor({ id: 'far-woman', row: 0, z: -36, speed: 1.4, phase: 10 });
  visitor({ id: 'far-man', row: 1, z: -39, speed: 1.3, phase: 21, direction: -1, height: 4.1 });
  visitor({ id: 'window-shoppers', atlas: shoppers, columns: 3, rows: 1, height: 4.6, x: 5.8, z: -41 });

  const gestures = [0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 0, 0];
  return {
    update(time, cameraZ) {
      const step = Math.floor(time * 8);
      for (const person of people) {
        const { body, map, speed, phase, direction, columns, rows, row } = person;
        if (speed) body.position.x = direction * (-15 + ((step / 8 * speed + phase) % 30));
        const cel = speed ? Math.floor(time * 6 + phase) % columns : gestures[Math.floor(time * 2) % gestures.length];
        if (cel !== person.cel) {
          person.cel = cel;
          map.offset.set(cel / columns, 1 - (row + 1) / rows);
        }
        body.visible = person.z < cameraZ - .7;
        person.contact.visible = body.visible;
        person.contact.position.x = body.position.x;
      }
    },
    diagnostics() {
      return people.map(p => ({ id: p.id, cel: p.cel, x: p.body.position.x, z: p.z,
        footY: p.body.position.y - (488 / 512 - .5) * p.body.geometry.parameters.height,
        screen: project(p.body.position.x, 0, p.z), visible: p.body.visible }));
    },
  };
}
