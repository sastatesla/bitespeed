import { PrismaClient, Contact } from "@prisma/client";

/**
 * Recursively collect all contacts linked to a given group
 */
export async function findAllLinkedContacts(
  prisma: PrismaClient,
  initialContacts: Contact[]
): Promise<Contact[]> {
  const visited = new Set<number>();
  const contacts: Contact[] = [];

  async function collect(contact: Contact) {
    if (visited.has(contact.id)) return;
    visited.add(contact.id);
    contacts.push(contact);

    // Find secondaries
    const secondaries = await prisma.contact.findMany({
      where: { linkedId: contact.id },
    });
    for (const sec of secondaries) await collect(sec);

    // Find parent, if any
    if (contact.linkedId) {
      const parent = await prisma.contact.findUnique({ where: { id: contact.linkedId } });
      if (parent) await collect(parent);
    }
  }

  for (const c of initialContacts) {
    await collect(c);
  }
  return contacts;
}

/**
 * Finds the primary contact (oldest createdAt or id)
 */
export function getPrimaryContact(contacts: Contact[]): Contact {
  return (
    contacts
      .filter((c) => c.linkPrecedence === "primary")
      .sort((a, b) => +a.createdAt - +b.createdAt)[0] || contacts[0]
  );
}

/**
 * Ensures all contacts except primary are set as secondary and linked
 */
export async function ensureSecondaryLinks(
  prisma: PrismaClient,
  contacts: Contact[],
  primary: Contact
) {
  for (const contact of contacts) {
    if (contact.id !== primary.id && contact.linkPrecedence !== "secondary") {
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          linkPrecedence: "secondary",
          linkedId: primary.id,
        },
      });
    }
  }
}

/**
 * Ensures a new contact is created and linked if the (email, phoneNumber) does not already exist
 */
export async function ensureNewContactInGroup(
  prisma: PrismaClient,
  contacts: Contact[],
  input: { email?: string; phoneNumber?: string },
  primary: Contact
) {
  const { email, phoneNumber } = input;
  const alreadyExists = contacts.some(
    (c) => c.email === email && c.phoneNumber === phoneNumber
  );
  if (!alreadyExists && (email || phoneNumber)) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primary.id,
        linkPrecedence: "secondary",
      },
    });
  }
}

/**
 * Formats the unified response
 */
export function getContactResponseData(primary: Contact, contacts: Contact[]) {
  const emails = [
    ...new Set(contacts.map((c) => c.email).filter((e) => !!e)),
  ];
  const phoneNumbers = [
    ...new Set(contacts.map((c) => c.phoneNumber).filter((p) => !!p)),
  ];
  const secondaryContactIds = contacts
    .filter((c) => c.linkPrecedence === "secondary")
    .map((c) => c.id);

  return {
    primaryContatctId: primary.id,
    emails,
    phoneNumbers,
    secondaryContactIds,
  };
}