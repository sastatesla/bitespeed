import { PrismaClient, Contact } from "@prisma/client";
import { BadRequestException } from "../utils/exceptions";
import {
  findAllLinkedContacts,
  getPrimaryContact,
  ensureSecondaryLinks,
  ensureNewContactInGroup,
  getContactResponseData,
} from "../helpers/identity.helper";
import { IdentityPayload } from "../types/identity.types";

const prisma = new PrismaClient();

class IdentityService {
  constructor() {
    this.identify = this.identify.bind(this);
  }

  public async identify(input: IdentityPayload) {
    const { email, phoneNumber } = input;


    // 1. Find all contacts with matching email or phone
    const foundContacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean) as any[],
      },
    });

    let contactsInGroup: Contact[] = [];
    let primaryContact: Contact | null = null;

    if (foundContacts.length > 0) {
      // 2. Collect all linked contacts to form the group
      contactsInGroup = await findAllLinkedContacts(prisma, foundContacts);

      // 3. Find the primary contact (oldest)
      primaryContact = getPrimaryContact(contactsInGroup);

      // 4. Ensure all others are secondary and linked to the primary
      await ensureSecondaryLinks(prisma, contactsInGroup, primaryContact);

      // 5. If this is a new email/phone, create and link secondary
      await ensureNewContactInGroup(prisma, contactsInGroup, { email, phoneNumber }, primaryContact);

      // 6. Refresh group
      contactsInGroup = await findAllLinkedContacts(prisma, [primaryContact]);
    } else {
      // 7. If no contact exists, create as primary
      primaryContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });
      contactsInGroup = [primaryContact];
    }

    // 8. Build response
    return {
      contact: getContactResponseData(primaryContact, contactsInGroup),
    };
  }
}

export default new IdentityService();