import Record from './records/record';
import GaiaDocument from './gaia_document';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function mockSession(session) {
  Record.config({ session });
}

function serialize(payload) {
  return JSON.parse(JSON.stringify(payload));
}

test('new documents are version = 2', async () => {
  const doc = new GaiaDocument({});
  expect(doc.version).toBe(2);
});

describe('v2', () => {
  describe('.save', () => {
    test('sets appropriate attributes', async () => {
      mockSession({ putFile: async() => true });

      const attributes = {
        name: 'name.pdf',
        size: 500,
        file: new File([1], '...')
      }
      const doc = new GaiaDocument(attributes);
      await doc.save();

      expect(doc.version).toBe(2);
      expect(doc.url).toMatch(uuidRegex);
      expect(doc.name).toEqual('name.pdf');
    });
  });

  describe('.get', () => {
    test('parses document', async () => {
      const v2Attributes = {
        id: '123',
        url: 'abcdef',
        name: 'name.pdf',
        size: 500,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        uploaded: true,
        version: 2
      }

      mockSession({ getFile: async() => JSON.stringify(v2Attributes) });

      const doc = await GaiaDocument.get('123');

      expect(doc.url).toBe('abcdef');
      expect(doc.name).toBe('name.pdf');
      expect(doc.size).toBe(500);
      expect(doc.created_at).toEqual(new Date('2019-07-16T10:47:39.865Z'));
      expect(doc.num_parts).toBe(2);
      expect(doc.uploaded).toBe(true);
      expect(doc.version).toBe(2);
    });
  });

  describe('.serialize', () => {
    test('serializes attributes', async () => {
      const attributes = {
        id: '123',
        name: 'name.pdf',
        url: 'abcdef',
        size: 500,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        uploaded: true,
        version: 2
      }

      const doc = new GaiaDocument(attributes);
      const docJson = serialize(doc);

      const expectedJson = serialize({
        id: '123',
        content_type: null,
        localId: '123',
        version: 2,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        size: 500,
        url: 'abcdef',
        name: 'name.pdf',
        uploaded: true
      });

      expect(docJson).toEqual(expectedJson);
    });
  })
});

describe('v1', () => {
  const v1Attributes = {
    id: '123',
    url: 'abcdef/name.pdf',
    size: 500,
    created_at: new Date('2019-07-16T10:47:39.865Z'),
    num_parts: 2,
    uploaded: true
  }

  describe('.get', () => {
    describe('new', () => {
      test('parses fields', async () => {
        const doc = new GaiaDocument(v1Attributes);

        expect(doc.url).toBe('abcdef/name.pdf');
        expect(doc.name).toBe('name.pdf');
        expect(doc.size).toBe(500);
        expect(doc.created_at).toEqual(new Date('2019-07-16T10:47:39.865Z'));
        expect(doc.num_parts).toBe(2);
        expect(doc.uploaded).toBe(true);
        expect(doc.version).toBe(1);
      });
    });

    test('parses document', async () => {
      mockSession({ getFile: async() => JSON.stringify(v1Attributes) })

      const doc = await GaiaDocument.get('123');

      expect(doc.url).toBe('abcdef/name.pdf');
      expect(doc.name).toBe('name.pdf');
      expect(doc.size).toBe(500);
      expect(doc.created_at).toEqual(new Date('2019-07-16T10:47:39.865Z'));
      expect(doc.num_parts).toBe(2);
      expect(doc.uploaded).toBe(true);
      expect(doc.version).toBe(1);
    });
  });

  describe('.serialize', () => {
    test('serializes from v1 attributes', async () => {
      mockSession({ getFile: async() => JSON.stringify(v1Attributes) })

      const doc = await GaiaDocument.get('123');
      const docJson = serialize(doc);

      const expectedJson = serialize({
        id: '123',
        content_type: null,
        localId: '123',
        version: 1,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        size: 500,
        url: 'abcdef/name.pdf',
        name: 'name.pdf',
        uploaded: true
      });

      expect(docJson).toEqual(expectedJson);
    });

    test('serializes from new attributes', async () => {
      const attributes = {
        id: '123',
        url: 'abcdef/name.pdf',
        size: 500,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        uploaded: true
      }

      mockSession({ getFile: async() => JSON.stringify(attributes) })

      const doc = await GaiaDocument.get('123');
      const docJson = serialize(doc);

      const expectedJson = serialize({
        id: '123',
        content_type: null,
        localId: '123',
        version: 1,
        created_at: new Date('2019-07-16T10:47:39.865Z'),
        num_parts: 2,
        size: 500,
        url: 'abcdef/name.pdf',
        name: 'name.pdf',
        uploaded: true
      });

      expect(docJson).toEqual(expectedJson);
    });
  });
});
