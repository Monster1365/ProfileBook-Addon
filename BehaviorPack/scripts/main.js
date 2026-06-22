import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getProfiles, saveProfiles } from "./util";
import {
  createProfile,
  listProfiles,
  showMyProfiles,
  showAdminPanel,
} from "./core";

world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const item = event.player
    .getComponent("minecraft:equippable")
    ?.getEquipment("Mainhand");
  if (!item) return;
  if (item.typeId === "profile:book" || item.typeId === "profile:op_book") {
    event.cancel = true;
  }
});

world.afterEvents.itemUse.subscribe(async (event) => {
  const player = event.source;

  const itemId = event.itemStack.typeId;
  if (itemId !== "profile:book" && itemId !== "profile:op_book") return;

  const form = new ActionFormData()
    .title("프로필 시스템")
    .button("새 프로필 작성")
    .button("프로필 목록")
    .button("내 프로필");

  if (itemId === "profile:op_book") {
    form.button("§e관리자 패널");
  }
  form.button("§c닫기");

  const result = await form.show(player);

  if (result.canceled) return;

  if (result.selection === 0) {
    createProfile(player);
  } else if (result.selection === 1) {
    listProfiles(player);
  } else if (result.selection === 2) {
    showMyProfiles(player);
  } else if (itemId === "profile:op_book" && result.selection === 3) {
    showAdminPanel(player);
  } else return;
});
